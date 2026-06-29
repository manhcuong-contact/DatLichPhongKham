-- ============================================================
-- MEDIFLOW - STORED PROCEDURES
-- ============================================================
USE MediFlowDB;
GO

-- ============================================================
-- SP: Kiểm tra trùng lịch bác sĩ
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_CheckDoctorConflict
    @doctorId       INT,
    @appointmentDate DATE,
    @startTime      NVARCHAR(5),
    @endTime        NVARCHAR(5),
    @excludeApptId  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS conflictCount
    FROM dbo.Appointments
    WHERE doctorId       = @doctorId
      AND appointmentDate = @appointmentDate
      AND status         NOT IN ('cancelled','no_show')
      AND (@excludeApptId IS NULL OR id <> @excludeApptId)
      AND (
            (@startTime >= startTime AND @startTime < endTime)
         OR (@endTime   >  startTime AND @endTime  <= endTime)
         OR (@startTime <= startTime AND @endTime  >= endTime)
      );
END;
GO

-- ============================================================
-- SP: Kiểm tra trùng lịch bệnh nhân
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_CheckPatientConflict
    @patientId      INT,
    @appointmentDate DATE,
    @startTime      NVARCHAR(5),
    @endTime        NVARCHAR(5),
    @excludeApptId  INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT COUNT(*) AS conflictCount
    FROM dbo.Appointments
    WHERE patientId      = @patientId
      AND appointmentDate = @appointmentDate
      AND status         NOT IN ('cancelled','no_show')
      AND (@excludeApptId IS NULL OR id <> @excludeApptId)
      AND (
            (@startTime >= startTime AND @startTime < endTime)
         OR (@endTime   >  startTime AND @endTime  <= endTime)
         OR (@startTime <= startTime AND @endTime  >= endTime)
      );
END;
GO

-- ============================================================
-- SP: Lấy slot còn trống của bác sĩ trong ngày
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetAvailableSlots
    @doctorId       INT,
    @appointmentDate DATE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @dayOfWeek TINYINT = DATEPART(WEEKDAY, @appointmentDate);
    -- SQL Server: 1=Sun,2=Mon,...7=Sat → convert to 1=Mon,...7=Sun
    SET @dayOfWeek = CASE @dayOfWeek
        WHEN 1 THEN 7
        ELSE @dayOfWeek - 1
    END;

    -- Lấy lịch làm việc của bác sĩ trong ngày
    SELECT
        ds.startTime,
        ds.endTime,
        ds.slotDuration,
        CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END AS isBooked,
        a.id AS appointmentId
    FROM dbo.DoctorSchedules ds
    LEFT JOIN dbo.Appointments a
        ON  a.doctorId       = ds.doctorId
        AND a.appointmentDate = @appointmentDate
        AND a.startTime      = ds.startTime
        AND a.status        NOT IN ('cancelled','no_show')
    WHERE ds.doctorId  = @doctorId
      AND ds.dayOfWeek = @dayOfWeek
      AND ds.isActive  = 1
    ORDER BY ds.startTime;
END;
GO

-- ============================================================
-- SP: Đặt lịch (transaction)
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_BookAppointment
    @patientId      INT,
    @doctorId       INT,
    @clinicId       INT,
    @specialtyId    INT,
    @appointmentDate DATE,
    @startTime      NVARCHAR(5),
    @endTime        NVARCHAR(5),
    @symptoms       NVARCHAR(MAX),
    @fee            DECIMAL(12,0),
    @newId          INT OUTPUT,
    @errorMsg       NVARCHAR(500) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- 1. Kiểm tra trùng bác sĩ
        DECLARE @docConflict INT;
        EXEC dbo.sp_CheckDoctorConflict @doctorId, @appointmentDate, @startTime, @endTime;
        SELECT @docConflict = conflictCount FROM (
            SELECT COUNT(*) AS conflictCount FROM dbo.Appointments
            WHERE doctorId = @doctorId AND appointmentDate = @appointmentDate
              AND status NOT IN ('cancelled','no_show')
              AND ((@startTime >= startTime AND @startTime < endTime)
                OR (@endTime > startTime AND @endTime <= endTime)
                OR (@startTime <= startTime AND @endTime >= endTime))
        ) t;

        IF @docConflict > 0
        BEGIN
            SET @errorMsg = N'Bác sĩ đã có lịch khám vào thời gian này';
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 2. Kiểm tra trùng bệnh nhân
        DECLARE @patConflict INT;
        SELECT @patConflict = COUNT(*) FROM dbo.Appointments
        WHERE patientId = @patientId AND appointmentDate = @appointmentDate
          AND status NOT IN ('cancelled','no_show')
          AND ((@startTime >= startTime AND @startTime < endTime)
            OR (@endTime > startTime AND @endTime <= endTime)
            OR (@startTime <= startTime AND @endTime >= endTime));

        IF @patConflict > 0
        BEGIN
            SET @errorMsg = N'Bạn đã có lịch khám vào thời gian này';
            ROLLBACK TRANSACTION;
            RETURN;
        END;

        -- 3. Tạo mã xác nhận
        DECLARE @code NVARCHAR(20) = 'MF' + FORMAT(GETDATE(),'yyMMddHHmm') + RIGHT(CAST(ABS(CHECKSUM(NEWID())) AS NVARCHAR(6)), 4);

        -- 4. Insert appointment
        INSERT INTO dbo.Appointments
            (patientId, doctorId, clinicId, specialtyId, appointmentDate, startTime, endTime,
             status, symptoms, consultationFee, confirmationCode)
        VALUES
            (@patientId, @doctorId, @clinicId, @specialtyId, @appointmentDate, @startTime, @endTime,
             'pending', @symptoms, @fee, @code);

        SET @newId = SCOPE_IDENTITY();

        -- 5. Log status
        INSERT INTO dbo.AppointmentStatus (appointmentId, status, note, changedBy)
        VALUES (@newId, 'pending', N'Đặt lịch mới', @patientId);

        SET @errorMsg = NULL;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @errorMsg = ERROR_MESSAGE();
        SET @newId = NULL;
    END CATCH;
END;
GO

-- ============================================================
-- SP: Thống kê dashboard admin
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_AdminDashboardStats
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        (SELECT COUNT(*) FROM dbo.Users WHERE isActive = 1)                       AS totalUsers,
        (SELECT COUNT(*) FROM dbo.Doctors WHERE isActive = 1)                     AS totalDoctors,
        (SELECT COUNT(*) FROM dbo.Patients)                                        AS totalPatients,
        (SELECT COUNT(*) FROM dbo.Clinics WHERE isActive = 1)                     AS totalClinics,
        (SELECT COUNT(*) FROM dbo.Specialties WHERE isActive = 1)                 AS totalSpecialties,
        (SELECT COUNT(*) FROM dbo.Appointments)                                    AS totalAppointments,
        (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'pending')           AS pendingAppointments,
        (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'confirmed')         AS confirmedAppointments,
        (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'completed')         AS completedAppointments,
        (SELECT COUNT(*) FROM dbo.Appointments WHERE status = 'cancelled')         AS cancelledAppointments,
        (SELECT ISNULL(SUM(consultationFee),0) FROM dbo.Appointments
         WHERE status = 'completed')                                                AS totalRevenue,
        (SELECT COUNT(*) FROM dbo.Appointments
         WHERE appointmentDate = CAST(GETDATE() AS DATE))                          AS todayAppointments,
        (SELECT COUNT(*) FROM dbo.Appointments
         WHERE MONTH(appointmentDate) = MONTH(GETDATE())
           AND YEAR(appointmentDate)  = YEAR(GETDATE()))                            AS monthAppointments;
END;
GO

-- ============================================================
-- SP: Thống kê theo tháng trong năm
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_MonthlyStats
    @year INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @year IS NULL SET @year = YEAR(GETDATE());

    SELECT
        MONTH(appointmentDate)   AS month,
        COUNT(*)                 AS total,
        SUM(CASE WHEN status='completed'  THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status='cancelled'  THEN 1 ELSE 0 END) AS cancelled,
        ISNULL(SUM(CASE WHEN status='completed' THEN consultationFee END), 0) AS revenue
    FROM dbo.Appointments
    WHERE YEAR(appointmentDate) = @year
    GROUP BY MONTH(appointmentDate)
    ORDER BY MONTH(appointmentDate);
END;
GO

-- ============================================================
-- SP: Top bác sĩ theo số lịch hẹn
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_TopDoctors
    @topN INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    SELECT TOP (@topN)
        d.id           AS doctorId,
        u.fullName     AS doctorName,
        u.avatarUrl,
        s.name         AS specialtyName,
        c.name         AS clinicName,
        d.rating,
        d.totalReviews,
        COUNT(a.id)    AS totalAppointments,
        ISNULL(SUM(CASE WHEN a.status='completed' THEN a.consultationFee END),0) AS revenue
    FROM dbo.Doctors d
    JOIN dbo.Users u       ON u.id = d.userId
    JOIN dbo.Specialties s ON s.id = d.specialtyId
    JOIN dbo.Clinics c     ON c.id = d.clinicId
    LEFT JOIN dbo.Appointments a ON a.doctorId = d.id
    WHERE d.isActive = 1
    GROUP BY d.id, u.fullName, u.avatarUrl, s.name, c.name, d.rating, d.totalReviews
    ORDER BY totalAppointments DESC;
END;
GO

-- ============================================================
-- SP: Nhắc lịch hẹn trong ngày (cho cron job)
-- ============================================================
CREATE OR ALTER PROCEDURE dbo.sp_GetTodayAppointmentsForReminder
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        a.id,
        a.appointmentDate,
        a.startTime,
        a.endTime,
        a.confirmationCode,
        -- Patient info
        pu.fullName  AS patientName,
        pu.email     AS patientEmail,
        pu.phone     AS patientPhone,
        -- Doctor info
        du.fullName  AS doctorName,
        -- Clinic info
        cl.name      AS clinicName,
        cl.address   AS clinicAddress,
        -- Specialty
        sp.name      AS specialtyName
    FROM dbo.Appointments a
    JOIN dbo.Users    pu ON pu.id = a.patientId
    JOIN dbo.Doctors  d  ON d.id  = a.doctorId
    JOIN dbo.Users    du ON du.id = d.userId
    JOIN dbo.Clinics  cl ON cl.id = a.clinicId
    JOIN dbo.Specialties sp ON sp.id = a.specialtyId
    WHERE a.appointmentDate = CAST(GETDATE() AS DATE)
      AND a.status IN ('pending','confirmed')
      AND a.reminderSent = 0;
END;
GO

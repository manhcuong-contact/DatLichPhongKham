-- ============================================================
-- MEDIFLOW - TRIGGERS
-- ============================================================
USE MediFlowDB;
GO

-- Trigger: cập nhật updatedAt cho Users
CREATE OR ALTER TRIGGER trg_Users_UpdatedAt
ON dbo.Users AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Users SET updatedAt = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- Trigger: cập nhật updatedAt cho Appointments
CREATE OR ALTER TRIGGER trg_Appointments_UpdatedAt
ON dbo.Appointments AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Appointments SET updatedAt = GETDATE()
    WHERE id IN (SELECT id FROM inserted);
END;
GO

-- Trigger: sau khi appointment hoàn thành → tạo MedicalHistory
CREATE OR ALTER TRIGGER trg_Appointments_CreateHistory
ON dbo.Appointments AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Chỉ khi status thay đổi thành 'completed'
    INSERT INTO dbo.MedicalHistory (patientId, appointmentId, visitDate, diagnosis, prescription, doctorNotes)
    SELECT
        i.patientId,
        i.id,
        i.appointmentDate,
        i.diagnosis,
        i.prescription,
        i.notes
    FROM inserted i
    JOIN deleted  d ON d.id = i.id
    WHERE i.status = 'completed'
      AND d.status <> 'completed'
      AND NOT EXISTS (
          SELECT 1 FROM dbo.MedicalHistory mh
          WHERE mh.appointmentId = i.id
      );
END;
GO

-- Trigger: cập nhật rating bác sĩ sau khi có review
CREATE OR ALTER TRIGGER trg_ReviewDoctors_UpdateRating
ON dbo.ReviewDoctors AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @doctorId INT;

    -- Lấy doctorId từ inserted hoặc deleted
    SELECT @doctorId = ISNULL((SELECT TOP 1 doctorId FROM inserted), (SELECT TOP 1 doctorId FROM deleted));

    IF @doctorId IS NOT NULL
    BEGIN
        UPDATE dbo.Doctors
        SET rating       = ISNULL((SELECT AVG(CAST(rating AS FLOAT)) FROM dbo.ReviewDoctors WHERE doctorId = @doctorId AND isVisible = 1), 0),
            totalReviews = (SELECT COUNT(*) FROM dbo.ReviewDoctors WHERE doctorId = @doctorId AND isVisible = 1)
        WHERE id = @doctorId;
    END;
END;
GO

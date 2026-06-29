-- ============================================================
-- MEDIFLOW - VIEWS
-- ============================================================
USE MediFlowDB;
GO

-- View: thông tin bác sĩ đầy đủ
CREATE OR ALTER VIEW dbo.vw_DoctorFull AS
SELECT
    d.id           AS doctorId,
    d.userId,
    u.fullName,
    u.email,
    u.phone,
    u.avatarUrl,
    u.isActive,
    d.specialtyId,
    s.name         AS specialtyName,
    d.clinicId,
    c.name         AS clinicName,
    c.address      AS clinicAddress,
    c.district,
    c.city,
    d.licenseNumber,
    d.degree,
    d.experience,
    d.bio,
    d.consultationFee,
    d.rating,
    d.totalReviews,
    d.createdAt
FROM dbo.Doctors d
JOIN dbo.Users      u ON u.id = d.userId
JOIN dbo.Specialties s ON s.id = d.specialtyId
JOIN dbo.Clinics    c  ON c.id = d.clinicId;
GO

-- View: lịch hẹn đầy đủ
CREATE OR ALTER VIEW dbo.vw_AppointmentFull AS
SELECT
    a.id,
    a.status,
    a.appointmentDate,
    a.startTime,
    a.endTime,
    a.symptoms,
    a.notes,
    a.diagnosis,
    a.prescription,
    a.consultationFee,
    a.confirmationCode,
    a.cancelledAt,
    a.cancelReason,
    a.reminderSent,
    a.createdAt,
    -- Patient
    a.patientId,
    pu.fullName  AS patientName,
    pu.email     AS patientEmail,
    pu.phone     AS patientPhone,
    pu.avatarUrl AS patientAvatar,
    -- Doctor
    a.doctorId,
    d.userId     AS doctorUserId,
    du.fullName  AS doctorName,
    du.email     AS doctorEmail,
    du.phone     AS doctorPhone,
    du.avatarUrl AS doctorAvatar,
    d.degree     AS doctorDegree,
    d.experience AS doctorExperience,
    -- Clinic
    a.clinicId,
    cl.name      AS clinicName,
    cl.address   AS clinicAddress,
    cl.phone     AS clinicPhone,
    -- Specialty
    a.specialtyId,
    sp.name      AS specialtyName,
    sp.icon      AS specialtyIcon
FROM dbo.Appointments a
JOIN dbo.Users      pu ON pu.id = a.patientId
JOIN dbo.Doctors    d  ON d.id  = a.doctorId
JOIN dbo.Users      du ON du.id = d.userId
JOIN dbo.Clinics    cl ON cl.id = a.clinicId
JOIN dbo.Specialties sp ON sp.id = a.specialtyId;
GO

-- View: thống kê theo chuyên khoa
CREATE OR ALTER VIEW dbo.vw_SpecialtyStats AS
SELECT
    s.id,
    s.name,
    s.icon,
    COUNT(DISTINCT d.id)  AS totalDoctors,
    COUNT(DISTINCT a.id)  AS totalAppointments,
    ISNULL(AVG(CAST(d.rating AS FLOAT)),0) AS avgRating
FROM dbo.Specialties s
LEFT JOIN dbo.Doctors      d  ON d.specialtyId = s.id AND d.isActive = 1
LEFT JOIN dbo.Appointments a  ON a.specialtyId = s.id
WHERE s.isActive = 1
GROUP BY s.id, s.name, s.icon;
GO

-- View: thống kê theo phòng khám
CREATE OR ALTER VIEW dbo.vw_ClinicStats AS
SELECT
    c.id,
    c.name,
    c.address,
    c.city,
    c.rating,
    c.totalReviews,
    COUNT(DISTINCT d.id)  AS totalDoctors,
    COUNT(DISTINCT a.id)  AS totalAppointments,
    ISNULL(SUM(CASE WHEN a.status='completed' THEN a.consultationFee END),0) AS revenue
FROM dbo.Clinics c
LEFT JOIN dbo.Doctors      d ON d.clinicId = c.id AND d.isActive = 1
LEFT JOIN dbo.Appointments a ON a.clinicId = c.id
WHERE c.isActive = 1
GROUP BY c.id, c.name, c.address, c.city, c.rating, c.totalReviews;
GO

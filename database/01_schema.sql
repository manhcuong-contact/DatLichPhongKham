-- ============================================================
-- MEDIFLOW - DATABASE SCHEMA
-- SQL Server Express
-- ============================================================

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'MediFlowDB')
BEGIN
    CREATE DATABASE MediFlowDB;
END
GO

USE MediFlowDB;
GO

-- ============================================================
-- DROP TABLES (nếu tồn tại - thứ tự ngược FK)
-- ============================================================
IF OBJECT_ID('dbo.ReminderEmails',    'U') IS NOT NULL DROP TABLE dbo.ReminderEmails;
IF OBJECT_ID('dbo.Notifications',     'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.ReviewDoctors',     'U') IS NOT NULL DROP TABLE dbo.ReviewDoctors;
IF OBJECT_ID('dbo.MedicalHistory',    'U') IS NOT NULL DROP TABLE dbo.MedicalHistory;
IF OBJECT_ID('dbo.AppointmentStatus', 'U') IS NOT NULL DROP TABLE dbo.AppointmentStatus;
IF OBJECT_ID('dbo.Appointments',      'U') IS NOT NULL DROP TABLE dbo.Appointments;
IF OBJECT_ID('dbo.DoctorSchedules',   'U') IS NOT NULL DROP TABLE dbo.DoctorSchedules;
IF OBJECT_ID('dbo.SymptomsMapping',   'U') IS NOT NULL DROP TABLE dbo.SymptomsMapping;
IF OBJECT_ID('dbo.Doctors',           'U') IS NOT NULL DROP TABLE dbo.Doctors;
IF OBJECT_ID('dbo.Patients',          'U') IS NOT NULL DROP TABLE dbo.Patients;
IF OBJECT_ID('dbo.Clinics',           'U') IS NOT NULL DROP TABLE dbo.Clinics;
IF OBJECT_ID('dbo.Specialties',       'U') IS NOT NULL DROP TABLE dbo.Specialties;
IF OBJECT_ID('dbo.RolePermissions',   'U') IS NOT NULL DROP TABLE dbo.RolePermissions;
IF OBJECT_ID('dbo.Permissions',       'U') IS NOT NULL DROP TABLE dbo.Permissions;
IF OBJECT_ID('dbo.Users',             'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Roles',             'U') IS NOT NULL DROP TABLE dbo.Roles;
GO

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE dbo.Roles (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(50)  NOT NULL UNIQUE,
    description NVARCHAR(200) NULL,
    createdAt   DATETIME2     NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 2. PERMISSIONS
-- ============================================================
CREATE TABLE dbo.Permissions (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL UNIQUE,   -- e.g. 'clinic:create'
    description NVARCHAR(200) NULL
);
GO

-- ============================================================
-- 3. ROLE_PERMISSIONS (junction)
-- ============================================================
CREATE TABLE dbo.RolePermissions (
    roleId       INT NOT NULL,
    permissionId INT NOT NULL,
    PRIMARY KEY (roleId, permissionId),
    CONSTRAINT FK_RolePerm_Role  FOREIGN KEY (roleId)       REFERENCES dbo.Roles(id)       ON DELETE CASCADE,
    CONSTRAINT FK_RolePerm_Perm  FOREIGN KEY (permissionId) REFERENCES dbo.Permissions(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 4. USERS (tài khoản hệ thống)
-- ============================================================
CREATE TABLE dbo.Users (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    fullName        NVARCHAR(150) NOT NULL,
    email           NVARCHAR(150) NOT NULL,
    password        NVARCHAR(255) NOT NULL,
    phone           NVARCHAR(20)  NULL,
    avatarUrl       NVARCHAR(500) NULL,
    roleId          INT           NOT NULL DEFAULT 3,   -- 1=admin,2=doctor,3=patient
    isActive        BIT           NOT NULL DEFAULT 1,
    isEmailVerified BIT           NOT NULL DEFAULT 0,
    refreshToken    NVARCHAR(500) NULL,
    resetToken      NVARCHAR(255) NULL,
    resetTokenExpiry DATETIME2    NULL,
    lastLogin       DATETIME2     NULL,
    createdAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updatedAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Users_Email UNIQUE (email),
    CONSTRAINT FK_Users_Role  FOREIGN KEY (roleId) REFERENCES dbo.Roles(id)
);

CREATE INDEX IX_Users_Email  ON dbo.Users(email);
CREATE INDEX IX_Users_RoleId ON dbo.Users(roleId);
GO

-- ============================================================
-- 5. SPECIALTIES (chuyên khoa)
-- ============================================================
CREATE TABLE dbo.Specialties (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(100) NOT NULL,
    description NVARCHAR(MAX) NULL,
    icon        NVARCHAR(100) NULL DEFAULT 'bi-heart-pulse',
    imageUrl    NVARCHAR(500) NULL,
    isActive    BIT           NOT NULL DEFAULT 1,
    createdAt   DATETIME2     NOT NULL DEFAULT GETDATE(),
    updatedAt   DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Specialties_Name UNIQUE (name)
);
GO

-- ============================================================
-- 6. CLINICS (phòng khám)
-- ============================================================
CREATE TABLE dbo.Clinics (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    name        NVARCHAR(200) NOT NULL,
    address     NVARCHAR(500) NOT NULL,
    district    NVARCHAR(100) NULL,
    city        NVARCHAR(100) NULL DEFAULT N'TP. Hồ Chí Minh',
    phone       NVARCHAR(20)  NULL,
    email       NVARCHAR(150) NULL,
    website     NVARCHAR(300) NULL,
    imageUrl    NVARCHAR(500) NULL,
    latitude    DECIMAL(10,7) NULL,
    longitude   DECIMAL(10,7) NULL,
    googleMapUrl NVARCHAR(500) NULL,
    openTime    NVARCHAR(5)   NULL DEFAULT '07:00',
    closeTime   NVARCHAR(5)   NULL DEFAULT '17:00',
    rating      DECIMAL(3,2)  NOT NULL DEFAULT 0,
    totalReviews INT          NOT NULL DEFAULT 0,
    description NVARCHAR(MAX) NULL,
    isActive    BIT           NOT NULL DEFAULT 1,
    createdAt   DATETIME2     NOT NULL DEFAULT GETDATE(),
    updatedAt   DATETIME2     NOT NULL DEFAULT GETDATE()
);

CREATE INDEX IX_Clinics_City ON dbo.Clinics(city);
GO

-- ============================================================
-- 7. PATIENTS (thông tin bệnh nhân - linked to Users)
-- ============================================================
CREATE TABLE dbo.Patients (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    userId          INT           NOT NULL,
    dateOfBirth     DATE          NULL,
    gender          NVARCHAR(10)  NULL CHECK (gender IN ('male','female','other')),
    address         NVARCHAR(500) NULL,
    idCard          NVARCHAR(20)  NULL,       -- CCCD
    bloodType       NVARCHAR(5)   NULL CHECK (bloodType IN ('A','B','AB','O','A+','A-','B+','B-','AB+','AB-','O+','O-')),
    allergies       NVARCHAR(MAX) NULL,
    insuranceNumber NVARCHAR(50)  NULL,
    emergencyContact NVARCHAR(200) NULL,
    createdAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updatedAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Patients_User FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE,
    CONSTRAINT UQ_Patients_UserId UNIQUE (userId)
);

CREATE INDEX IX_Patients_UserId ON dbo.Patients(userId);
GO

-- ============================================================
-- 8. DOCTORS (thông tin bác sĩ - linked to Users)
-- ============================================================
CREATE TABLE dbo.Doctors (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    userId          INT           NOT NULL,
    specialtyId     INT           NOT NULL,
    clinicId        INT           NOT NULL,
    licenseNumber   NVARCHAR(50)  NULL,
    degree          NVARCHAR(200) NULL,
    experience      INT           NULL DEFAULT 0,  -- số năm
    bio             NVARCHAR(MAX) NULL,
    consultationFee DECIMAL(12,0) NOT NULL DEFAULT 0,
    rating          DECIMAL(3,2)  NOT NULL DEFAULT 0,
    totalReviews    INT           NOT NULL DEFAULT 0,
    isActive        BIT           NOT NULL DEFAULT 1,
    createdAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
    updatedAt       DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Doctors_User      FOREIGN KEY (userId)      REFERENCES dbo.Users(id)       ON DELETE CASCADE,
    CONSTRAINT FK_Doctors_Specialty FOREIGN KEY (specialtyId) REFERENCES dbo.Specialties(id),
    CONSTRAINT FK_Doctors_Clinic    FOREIGN KEY (clinicId)    REFERENCES dbo.Clinics(id),
    CONSTRAINT UQ_Doctors_UserId    UNIQUE (userId)
);

CREATE INDEX IX_Doctors_SpecialtyId ON dbo.Doctors(specialtyId);
CREATE INDEX IX_Doctors_ClinicId    ON dbo.Doctors(clinicId);
GO

-- ============================================================
-- 9. DOCTOR_SCHEDULES (lịch làm việc)
-- ============================================================
CREATE TABLE dbo.DoctorSchedules (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    doctorId    INT          NOT NULL,
    dayOfWeek   TINYINT      NOT NULL CHECK (dayOfWeek BETWEEN 1 AND 7),  -- 1=Mon,...,7=Sun
    startTime   NVARCHAR(5)  NOT NULL,   -- HH:mm
    endTime     NVARCHAR(5)  NOT NULL,
    slotDuration INT         NOT NULL DEFAULT 30,   -- phút/lịch
    isActive    BIT          NOT NULL DEFAULT 1,
    CONSTRAINT FK_DoctorSchedules_Doctor FOREIGN KEY (doctorId) REFERENCES dbo.Doctors(id) ON DELETE CASCADE,
    CONSTRAINT UQ_DoctorSchedule UNIQUE (doctorId, dayOfWeek, startTime)
);

CREATE INDEX IX_DoctorSchedules_DoctorId ON dbo.DoctorSchedules(doctorId);
GO

-- ============================================================
-- 10. APPOINTMENTS (lịch hẹn)
-- ============================================================
CREATE TABLE dbo.Appointments (
    id               INT IDENTITY(1,1) PRIMARY KEY,
    patientId        INT           NOT NULL,   -- userId of patient
    doctorId         INT           NOT NULL,   -- doctorId (Doctors.id)
    clinicId         INT           NOT NULL,
    specialtyId      INT           NOT NULL,
    appointmentDate  DATE          NOT NULL,
    startTime        NVARCHAR(5)   NOT NULL,
    endTime          NVARCHAR(5)   NOT NULL,
    status           NVARCHAR(20)  NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
    symptoms         NVARCHAR(MAX) NULL,
    notes            NVARCHAR(MAX) NULL,
    diagnosis        NVARCHAR(MAX) NULL,
    prescription     NVARCHAR(MAX) NULL,
    consultationFee  DECIMAL(12,0) NULL DEFAULT 0,
    confirmationCode NVARCHAR(20)  NULL,
    cancelledAt      DATETIME2     NULL,
    cancelReason     NVARCHAR(500) NULL,
    reminderSent     BIT           NOT NULL DEFAULT 0,
    createdAt        DATETIME2     NOT NULL DEFAULT GETDATE(),
    updatedAt        DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Appt_Patient   FOREIGN KEY (patientId)   REFERENCES dbo.Users(id),
    CONSTRAINT FK_Appt_Doctor    FOREIGN KEY (doctorId)    REFERENCES dbo.Doctors(id),
    CONSTRAINT FK_Appt_Clinic    FOREIGN KEY (clinicId)    REFERENCES dbo.Clinics(id),
    CONSTRAINT FK_Appt_Specialty FOREIGN KEY (specialtyId) REFERENCES dbo.Specialties(id)
);

CREATE INDEX IX_Appt_PatientId        ON dbo.Appointments(patientId);
CREATE INDEX IX_Appt_DoctorId         ON dbo.Appointments(doctorId);
CREATE INDEX IX_Appt_Date             ON dbo.Appointments(appointmentDate);
CREATE INDEX IX_Appt_Doctor_Date_Time ON dbo.Appointments(doctorId, appointmentDate, startTime);
CREATE INDEX IX_Appt_Status           ON dbo.Appointments(status);
GO

-- ============================================================
-- 11. APPOINTMENT_STATUS (log trạng thái)
-- ============================================================
CREATE TABLE dbo.AppointmentStatus (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    appointmentId INT           NOT NULL,
    status        NVARCHAR(20)  NOT NULL,
    note          NVARCHAR(500) NULL,
    changedBy     INT           NULL,   -- userId
    changedAt     DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ApptStatus_Appt FOREIGN KEY (appointmentId) REFERENCES dbo.Appointments(id) ON DELETE CASCADE
);

CREATE INDEX IX_ApptStatus_ApptId ON dbo.AppointmentStatus(appointmentId);
GO

-- ============================================================
-- 12. REMINDER_EMAILS
-- ============================================================
CREATE TABLE dbo.ReminderEmails (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    appointmentId INT           NOT NULL,
    sentTo        NVARCHAR(150) NOT NULL,
    subject       NVARCHAR(300) NOT NULL,
    sentAt        DATETIME2     NOT NULL DEFAULT GETDATE(),
    status        NVARCHAR(20)  NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed')),
    errorMsg      NVARCHAR(500) NULL,
    CONSTRAINT FK_Reminder_Appt FOREIGN KEY (appointmentId) REFERENCES dbo.Appointments(id) ON DELETE CASCADE
);
GO

-- ============================================================
-- 13. REVIEW_DOCTORS (đánh giá bác sĩ)
-- ============================================================
CREATE TABLE dbo.ReviewDoctors (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    appointmentId INT           NOT NULL,
    patientId     INT           NOT NULL,   -- userId
    doctorId      INT           NOT NULL,   -- doctorId
    rating        TINYINT       NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment       NVARCHAR(MAX) NULL,
    isVisible     BIT           NOT NULL DEFAULT 1,
    createdAt     DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Review_Appt    FOREIGN KEY (appointmentId) REFERENCES dbo.Appointments(id),
    CONSTRAINT FK_Review_Patient FOREIGN KEY (patientId)     REFERENCES dbo.Users(id),
    CONSTRAINT FK_Review_Doctor  FOREIGN KEY (doctorId)      REFERENCES dbo.Doctors(id),
    CONSTRAINT UQ_Review_Appt    UNIQUE (appointmentId)   -- 1 review / 1 lịch hẹn
);

CREATE INDEX IX_Review_DoctorId ON dbo.ReviewDoctors(doctorId);
GO

-- ============================================================
-- 14. MEDICAL_HISTORY (lịch sử khám)
-- ============================================================
CREATE TABLE dbo.MedicalHistory (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    patientId     INT           NOT NULL,   -- userId
    appointmentId INT           NULL,
    visitDate     DATE          NOT NULL,
    diagnosis     NVARCHAR(MAX) NULL,
    prescription  NVARCHAR(MAX) NULL,
    doctorNotes   NVARCHAR(MAX) NULL,
    attachments   NVARCHAR(MAX) NULL,   -- JSON array of file paths
    createdAt     DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_MedHist_Patient FOREIGN KEY (patientId)     REFERENCES dbo.Users(id),
    CONSTRAINT FK_MedHist_Appt   FOREIGN KEY (appointmentId)  REFERENCES dbo.Appointments(id)
);

CREATE INDEX IX_MedHist_PatientId ON dbo.MedicalHistory(patientId);
GO

-- ============================================================
-- 15. NOTIFICATIONS
-- ============================================================
CREATE TABLE dbo.Notifications (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    userId    INT           NOT NULL,
    title     NVARCHAR(200) NOT NULL,
    message   NVARCHAR(MAX) NOT NULL,
    type      NVARCHAR(50)  NOT NULL DEFAULT 'info'
              CHECK (type IN ('info','success','warning','error','appointment')),
    isRead    BIT           NOT NULL DEFAULT 0,
    link      NVARCHAR(500) NULL,
    createdAt DATETIME2     NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_Notif_User FOREIGN KEY (userId) REFERENCES dbo.Users(id) ON DELETE CASCADE
);

CREATE INDEX IX_Notif_UserId ON dbo.Notifications(userId);
CREATE INDEX IX_Notif_IsRead ON dbo.Notifications(isRead);
GO

-- ============================================================
-- 16. SYMPTOMS_MAPPING (triệu chứng → chuyên khoa)
-- ============================================================
CREATE TABLE dbo.SymptomsMapping (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    keyword     NVARCHAR(100) NOT NULL,
    specialtyId INT           NOT NULL,
    CONSTRAINT FK_Symptom_Specialty FOREIGN KEY (specialtyId) REFERENCES dbo.Specialties(id) ON DELETE CASCADE
);

CREATE INDEX IX_Symptoms_Keyword ON dbo.SymptomsMapping(keyword);
GO

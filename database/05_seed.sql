-- ============================================================
-- MEDIFLOW - SEED DATA
-- ============================================================
USE MediFlowDB;
GO

-- ============================================================
-- ROLES
-- ============================================================
SET IDENTITY_INSERT dbo.Roles ON;
INSERT INTO dbo.Roles (id, name, description) VALUES
(1, 'admin',   N'Quản trị viên hệ thống'),
(2, 'doctor',  N'Bác sĩ'),
(3, 'patient', N'Bệnh nhân');
SET IDENTITY_INSERT dbo.Roles OFF;
GO

-- ============================================================
-- PERMISSIONS
-- ============================================================
INSERT INTO dbo.Permissions (name, description) VALUES
('user:read',        N'Xem người dùng'),
('user:write',       N'Thêm/sửa người dùng'),
('user:delete',      N'Xóa người dùng'),
('doctor:read',      N'Xem bác sĩ'),
('doctor:write',     N'Thêm/sửa bác sĩ'),
('clinic:read',      N'Xem phòng khám'),
('clinic:write',     N'Thêm/sửa phòng khám'),
('specialty:read',   N'Xem chuyên khoa'),
('specialty:write',  N'Thêm/sửa chuyên khoa'),
('appointment:read', N'Xem lịch hẹn'),
('appointment:write',N'Thêm/sửa lịch hẹn'),
('dashboard:read',   N'Xem dashboard'),
('analytics:read',   N'Xem thống kê');
GO

-- ============================================================
-- USERS (Admin + Doctors + Patients)
-- Mật khẩu: Admin@123456 (đã hash bằng bcrypt rounds=10)
-- ============================================================
-- Password hash for 'Admin@123456': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- Password hash for 'Doctor@123456': $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi  
-- NOTE: seeder.js sẽ hash lại bằng bcrypt khi chạy

SET IDENTITY_INSERT dbo.Users ON;
INSERT INTO dbo.Users (id, fullName, email, password, phone, roleId, isActive, isEmailVerified) VALUES
-- Admin
(1, N'Admin MediFlow',   'admin@mediflow.com',    '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0901000001', 1, 1, 1),
-- Doctors (roleId=2)
(2, N'BS. Nguyễn Văn An',  'dr.an@mediflow.com',    '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0901000002', 2, 1, 1),
(3, N'BS. Trần Thị Bình',  'dr.binh@mediflow.com',  '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0901000003', 2, 1, 1),
(4, N'BS. Lê Minh Châu',   'dr.chau@mediflow.com',  '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0901000004', 2, 1, 1),
(5, N'BS. Phạm Thị Dung',  'dr.dung@mediflow.com',  '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0901000005', 2, 1, 1),
(6, N'BS. Hoàng Văn Em',   'dr.em@mediflow.com',    '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0901000006', 2, 1, 1),
-- Patients (roleId=3)
(7, N'Nguyễn Thị Hoa',   'patient1@mediflow.com', '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0902000001', 3, 1, 1),
(8, N'Trần Văn Khoa',    'patient2@mediflow.com', '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0902000002', 3, 1, 1),
(9, N'Lê Thị Lan',       'patient3@mediflow.com', '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0902000003', 3, 1, 1),
(10,N'Phạm Văn Minh',    'patient4@mediflow.com', '$2a$10$UDZkRFD6OPHfu/m/uHq.H.pdWcsYEWcxnn7euFPdV8vpUjmrmK/Y2', '0902000004', 3, 1, 1);
SET IDENTITY_INSERT dbo.Users OFF;
GO

-- ============================================================
-- SPECIALTIES (10 chuyên khoa)
-- ============================================================
SET IDENTITY_INSERT dbo.Specialties ON;
INSERT INTO dbo.Specialties (id, name, description, icon, isActive) VALUES
(1, N'Tim mạch',        N'Chuyên khoa chẩn đoán và điều trị các bệnh tim mạch',         'bi-heart-pulse',      1),
(2, N'Nội tổng quát',   N'Khám và điều trị các bệnh nội khoa thông thường',              'bi-hospital',         1),
(3, N'Nhi khoa',        N'Chuyên khoa dành cho trẻ em từ sơ sinh đến 16 tuổi',           'bi-people',           1),
(4, N'Phụ sản',         N'Chăm sóc sức khỏe phụ nữ và thai sản',                        'bi-gender-female',    1),
(5, N'Ngoại tổng quát', N'Phẫu thuật và can thiệp ngoại khoa',                           'bi-scissors',         1),
(6, N'Mắt',             N'Khám và điều trị các bệnh về mắt và thị lực',                  'bi-eye',              1),
(7, N'Tai Mũi Họng',    N'Chuyên khoa tai mũi họng và các bệnh liên quan',               'bi-ear',              1),
(8, N'Răng Hàm Mặt',   N'Khám và điều trị các bệnh về răng, hàm, mặt',                 'bi-emoji-smile',      1),
(9, N'Thần kinh',       N'Chẩn đoán và điều trị các bệnh thần kinh',                    'bi-brain',            1),
(10,N'Da liễu',         N'Khám và điều trị các bệnh về da',                              'bi-person-badge',     1);
SET IDENTITY_INSERT dbo.Specialties OFF;
GO

-- ============================================================
-- CLINICS (5 phòng khám)
-- ============================================================
SET IDENTITY_INSERT dbo.Clinics ON;
INSERT INTO dbo.Clinics (id, name, address, district, city, phone, email, latitude, longitude, openTime, closeTime, rating, isActive) VALUES
(1, N'BV Đa Khoa MediFlow Q1',    N'123 Nguyễn Huệ, P. Bến Nghé',    N'Quận 1',     N'TP. Hồ Chí Minh', '028-3823-0001', 'clinic1@mediflow.com', 10.7769,  106.7009, '07:00', '17:00', 4.8, 1),
(2, N'Phòng Khám MediFlow Q3',    N'45 Võ Văn Tần, P. Võ Thị Sáu',  N'Quận 3',     N'TP. Hồ Chí Minh', '028-3930-0002', 'clinic2@mediflow.com', 10.7757,  106.6856, '07:00', '17:00', 4.6, 1),
(3, N'BV MediFlow Bình Thạnh',    N'78 Bạch Đằng, P.2',              N'Bình Thạnh', N'TP. Hồ Chí Minh', '028-3510-0003', 'clinic3@mediflow.com', 10.8080,  106.7101, '07:00', '17:00', 4.7, 1),
(4, N'Phòng Khám MediFlow Tân Phú',N'200 Lũy Bán Bích, P. Hòa Thạnh',N'Tân Phú',   N'TP. Hồ Chí Minh', '028-3817-0004', 'clinic4@mediflow.com', 10.7887,  106.6315, '07:30', '17:30', 4.5, 1),
(5, N'BV MediFlow Gò Vấp',        N'10 Quang Trung, P.10',           N'Gò Vấp',     N'TP. Hồ Chí Minh', '028-3895-0005', 'clinic5@mediflow.com', 10.8388,  106.6807, '07:00', '17:00', 4.9, 1);
SET IDENTITY_INSERT dbo.Clinics OFF;
GO

-- ============================================================
-- PATIENTS (profile)
-- ============================================================
SET IDENTITY_INSERT dbo.Patients ON;
INSERT INTO dbo.Patients (id, userId, dateOfBirth, gender, address, bloodType) VALUES
(1, 7,  '1990-05-15', 'female', N'12 Lê Lợi, Q.1, TP.HCM',           'B+'),
(2, 8,  '1985-08-22', 'male',   N'45 Nguyễn Trãi, Q.5, TP.HCM',      'O+'),
(3, 9,  '1995-12-01', 'female', N'78 Cộng Hòa, Tân Bình, TP.HCM',    'A+'),
(4, 10, '1980-03-10', 'male',   N'200 Đinh Tiên Hoàng, Bình Thạnh',   'AB+');
SET IDENTITY_INSERT dbo.Patients OFF;
GO

-- ============================================================
-- DOCTORS
-- ============================================================
SET IDENTITY_INSERT dbo.Doctors ON;
INSERT INTO dbo.Doctors (id, userId, specialtyId, clinicId, licenseNumber, degree, experience, bio, consultationFee, rating, isActive) VALUES
(1, 2, 1, 1, 'BS-001', N'Tiến sĩ Y khoa, ĐH Y Dược TP.HCM', 15, N'Chuyên gia tim mạch với 15 năm kinh nghiệm', 350000, 4.9, 1),
(2, 3, 2, 1, 'BS-002', N'Bác sĩ Nội khoa, ĐH Y Hà Nội',      10, N'Bác sĩ nội khoa giàu kinh nghiệm',          200000, 4.7, 1),
(3, 4, 3, 2, 'BS-003', N'Tiến sĩ Nhi khoa, ĐH Y Dược',        12, N'Chuyên gia nhi khoa tận tâm',               250000, 4.8, 1),
(4, 5, 4, 3, 'BS-004', N'Bác sĩ Phụ sản, ĐH Y Hà Nội',         8, N'Chuyên sản phụ khoa và thai sản',           300000, 4.6, 1),
(5, 6, 6, 4, 'BS-005', N'Bác sĩ CKI Mắt, ĐH Y Dược',           7, N'Chuyên điều trị các bệnh về mắt',           250000, 4.7, 1);
SET IDENTITY_INSERT dbo.Doctors OFF;
GO

-- ============================================================
-- DOCTOR SCHEDULES (lịch làm việc)
-- dayOfWeek: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
-- ============================================================
INSERT INTO dbo.DoctorSchedules (doctorId, dayOfWeek, startTime, endTime, slotDuration) VALUES
-- BS. Nguyễn Văn An (Tim mạch): T2-T6
(1,1,'08:00','11:30',30),(1,1,'13:00','16:30',30),
(1,2,'08:00','11:30',30),(1,2,'13:00','16:30',30),
(1,3,'08:00','11:30',30),(1,3,'13:00','16:30',30),
(1,4,'08:00','11:30',30),(1,4,'13:00','16:30',30),
(1,5,'08:00','11:30',30),(1,5,'13:00','16:30',30),
-- BS. Trần Thị Bình (Nội): T2,T4,T6,T7
(2,1,'07:30','12:00',30),(2,3,'07:30','12:00',30),
(2,5,'07:30','12:00',30),(2,6,'07:30','12:00',30),
-- BS. Lê Minh Châu (Nhi): T2-T6 sáng, T3,T5 chiều
(3,1,'08:00','11:30',30),(3,2,'08:00','11:30',30),
(3,3,'08:00','11:30',30),(3,3,'13:00','16:00',30),
(3,4,'08:00','11:30',30),(3,5,'08:00','11:30',30),(3,5,'13:00','16:00',30),
-- BS. Phạm Thị Dung (Phụ sản): T2,T3,T5,T6
(4,1,'07:30','11:30',30),(4,1,'13:00','16:30',30),
(4,2,'07:30','11:30',30),(4,4,'07:30','11:30',30),(4,4,'13:00','16:30',30),
(4,5,'07:30','11:30',30),
-- BS. Hoàng Văn Em (Mắt): T2-T7
(5,1,'08:00','11:30',30),(5,2,'08:00','11:30',30),
(5,3,'08:00','11:30',30),(5,4,'08:00','11:30',30),
(5,5,'08:00','11:30',30),(5,6,'08:00','11:30',30);
GO

-- ============================================================
-- APPOINTMENTS (lịch hẹn mẫu)
-- ============================================================
SET IDENTITY_INSERT dbo.Appointments ON;
INSERT INTO dbo.Appointments
    (id, patientId, doctorId, clinicId, specialtyId, appointmentDate, startTime, endTime, status, symptoms, consultationFee, confirmationCode, reminderSent)
VALUES
(1, 7,  1, 1, 1, DATEADD(DAY, 1, CAST(GETDATE() AS DATE)), '08:00', '08:30', 'confirmed', N'Đau ngực, khó thở', 350000, 'MF001', 0),
(2, 8,  2, 1, 2, DATEADD(DAY, 2, CAST(GETDATE() AS DATE)), '09:00', '09:30', 'pending',   N'Sốt cao, mệt mỏi',  200000, 'MF002', 0),
(3, 9,  3, 2, 3, DATEADD(DAY, 3, CAST(GETDATE() AS DATE)), '08:00', '08:30', 'pending',   N'Trẻ ho nhiều',      250000, 'MF003', 0),
(4, 10, 4, 3, 4, DATEADD(DAY,-5, CAST(GETDATE() AS DATE)), '07:30', '08:00', 'completed', N'Khám thai định kỳ', 300000, 'MF004', 1),
(5, 7,  5, 4, 6, DATEADD(DAY,-10,CAST(GETDATE() AS DATE)), '08:00', '08:30', 'completed', N'Mờ mắt',            250000, 'MF005', 1);
SET IDENTITY_INSERT dbo.Appointments OFF;
GO

-- Log trạng thái
INSERT INTO dbo.AppointmentStatus (appointmentId, status, note, changedBy) VALUES
(1, 'pending',   N'Đặt lịch mới', 7),
(1, 'confirmed', N'Bác sĩ xác nhận', 2),
(2, 'pending',   N'Đặt lịch mới', 8),
(3, 'pending',   N'Đặt lịch mới', 9),
(4, 'pending',   N'Đặt lịch mới', 10),
(4, 'confirmed', N'Bác sĩ xác nhận', 5),
(4, 'completed', N'Đã khám xong', 5),
(5, 'pending',   N'Đặt lịch mới', 7),
(5, 'confirmed', N'Bác sĩ xác nhận', 6),
(5, 'completed', N'Đã khám xong', 6);
GO

-- Reviews (chỉ cho completed)
INSERT INTO dbo.ReviewDoctors (appointmentId, patientId, doctorId, rating, comment) VALUES
(4, 10, 4, 5, N'Bác sĩ rất tận tâm, giải thích chi tiết. Rất hài lòng!'),
(5, 7,  5, 4, N'Phòng khám sạch sẽ, bác sĩ chuyên nghiệp.');
GO

-- Medical History (auto từ trigger, nhưng seed thêm cho demo)
INSERT INTO dbo.MedicalHistory (patientId, appointmentId, visitDate, diagnosis, prescription, doctorNotes) VALUES
(10, 4, DATEADD(DAY,-5,CAST(GETDATE() AS DATE)), N'Thai 20 tuần, phát triển bình thường', N'Acid folic 5mg/ngày, Vitamin tổng hợp', N'Tái khám sau 4 tuần'),
(7,  5, DATEADD(DAY,-10,CAST(GETDATE() AS DATE)),N'Cận thị độ 2.5, loạn thị nhẹ',          N'Kính cận 2.5 độ',                       N'Đo lại mắt sau 6 tháng');
GO

-- Notifications mẫu
INSERT INTO dbo.Notifications (userId, title, message, type) VALUES
(7, N'Lịch hẹn được xác nhận', N'Lịch hẹn MF001 ngày mai đã được bác sĩ xác nhận', 'appointment'),
(8, N'Lịch hẹn mới',          N'Bạn có lịch hẹn với BS. Trần Thị Bình', 'appointment'),
(7, N'Nhắc lịch khám',        N'Nhớ đi khám ngày mai lúc 08:00!', 'info');
GO

-- Symptoms Mapping (từ khóa → chuyên khoa)
INSERT INTO dbo.SymptomsMapping (keyword, specialtyId) VALUES
-- Tim mạch (1)
(N'đau tim', 1),(N'đau ngực', 1),(N'khó thở', 1),(N'hồi hộp', 1),(N'tim đập nhanh', 1),
(N'tức ngực', 1),(N'đánh trống ngực', 1),(N'huyết áp cao', 1),(N'cao huyết áp', 1),
-- Nội tổng quát (2)
(N'sốt', 2),(N'mệt mỏi', 2),(N'chán ăn', 2),(N'sút cân', 2),(N'đau đầu', 2),
(N'tiểu đường', 2),(N'đau bụng', 2),(N'buồn nôn', 2),(N'nôn mửa', 2),
-- Nhi khoa (3)
(N'trẻ em', 3),(N'trẻ sơ sinh', 3),(N'trẻ sốt', 3),(N'trẻ ho', 3),(N'bé quấy khóc', 3),
(N'trẻ biếng ăn', 3),(N'trẻ chậm phát triển', 3),
-- Phụ sản (4)
(N'khám thai', 4),(N'có thai', 4),(N'mang thai', 4),(N'thai sản', 4),(N'phụ khoa', 4),
(N'kinh nguyệt', 4),(N'rối loạn kinh', 4),(N'viêm phụ khoa', 4),
-- Ngoại tổng quát (5)
(N'phẫu thuật', 5),(N'ruột thừa', 5),(N'thoát vị', 5),(N'khối u', 5),(N'áp xe', 5),
-- Mắt (6)
(N'mờ mắt', 6),(N'đau mắt', 6),(N'mắt đỏ', 6),(N'cận thị', 6),(N'loạn thị', 6),
(N'viêm mắt', 6),(N'ngứa mắt', 6),(N'chảy nước mắt', 6),
-- Tai Mũi Họng (7)
(N'đau tai', 7),(N'ù tai', 7),(N'viêm tai', 7),(N'nghẹt mũi', 7),(N'chảy mũi', 7),
(N'đau họng', 7),(N'viêm họng', 7),(N'ho', 7),(N'khàn giọng', 7),(N'viêm amidan', 7),
-- Răng Hàm Mặt (8)
(N'đau răng', 8),(N'sâu răng', 8),(N'chảy máu chân răng', 8),(N'nhổ răng', 8),
(N'răng khôn', 8),(N'đau hàm', 8),(N'viêm nướu', 8),
-- Thần kinh (9)
(N'đau đầu dữ dội', 9),(N'chóng mặt', 9),(N'tê liệt', 9),(N'mất ý thức', 9),
(N'co giật', 9),(N'liệt', 9),(N'đột quỵ', 9),(N'run tay', 9),(N'mất ngủ', 9),
-- Da liễu (10)
(N'nổi mẩn', 10),(N'ngứa da', 10),(N'mụn', 10),(N'vảy nến', 10),(N'nám da', 10),
(N'dị ứng da', 10),(N'viêm da', 10),(N'rụng tóc', 10),(N'hắc lào', 10);
GO

PRINT N'✅ Seed data hoàn tất!';
GO

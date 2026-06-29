# BÁO CÁO TỔNG HỢP CẬP NHẬT DỰ ÁN MEDIFLOW
**Ngày lập báo cáo:** 29/06/2026
**Mô đun:** Backend API & Giao diện quản lý Frontend

---

## 1. TỔNG QUAN
Tài liệu này tổng hợp chi tiết các lỗi (bugs) đã được khắc phục, các tính năng mới được tích hợp và những điều chỉnh về mặt kiến trúc/hệ thống trong dự án MediFlow. Quá trình bảo trì và nâng cấp tuân thủ các nguyên tắc của Công nghệ phần mềm, bao gồm: xác định nguyên nhân gốc rễ (Root Cause Analysis), thiết kế giải pháp, triển khai mã nguồn và quản lý cấu hình.

---

## 2. QUẢN LÝ VÀ SỬA LỖI (BUG TRACKING & RESOLUTION)

### 2.1. Lỗi không bắt sự kiện click (Undefined ID)
- **Mô tả lỗi**: Các nút chức năng (Sửa, Hủy, Xem chi tiết) trên các màn hình quản lý lịch hẹn (Admin, Bác sĩ, Bệnh nhân) không phản hồi khi click. Console báo lỗi biến undefined.
- **Nguyên nhân gốc rễ**: Khi render HTML chuỗi động trong JavaScript, các biến ID dạng chuỗi (String/ObjectId) được truyền vào hàm sự kiện `onclick` nhưng thiếu dấu nháy đơn bảo vệ (`onclick="cancelApt(${a.id})"` thay vì `onclick="cancelApt('${a.id}')"`), dẫn đến trình duyệt không hiểu cú pháp.
- **Giải pháp**: Chuẩn hóa lại toàn bộ chuỗi render HTML, bọc tham số ID trong dấu nháy đơn.
- **Phạm vi file ảnh hưởng**:
  - `public/admin/appointments.html`
  - `public/doctor/dashboard.html`
  - `public/patient/dashboard.html`
  - `public/patient/history.html`

### 2.2. Lỗi không hiển thị thông tin hồ sơ bệnh nhân
- **Mô tả lỗi**: Thông tin bệnh nhân tại trang Dashboard của bệnh nhân bị trống rỗng dù cơ sở dữ liệu có lưu đầy đủ.
- **Nguyên nhân gốc rễ**: Frontend mong đợi một đối tượng phẳng (flat object) chứa trực tiếp các trường `fullName`, `email`, `phone`. Tuy nhiên, Backend DTO (Data Transfer Object) trả về đối tượng lồng ghép, trong đó các trường này nằm trong thuộc tính `userId` sau khi thực hiện lệnh `populate()`.
- **Giải pháp**: Áp dụng Data Mapping (DTO mapping) tại tầng Service. Chỉnh sửa `src/services/patientService.js` để "làm phẳng" (flatten) các trường của `userId` ra ngoài root object trước khi trả về cho Frontend.

### 2.3. Lỗi trống danh sách lịch sử khám bệnh
- **Mô tả lỗi**: Bệnh nhân không xem được lịch sử khám (danh sách trống) dù trạng thái cuộc hẹn đã là "Hoàn thành".
- **Nguyên nhân 1 - Ánh xạ Interface**: `medicalHistoryService` gọi phương thức `getByPatient()` trong khi `medicalHistoryRepository` lại định nghĩa là `getByPatientId()`.
- **Nguyên nhân 2 - Thiếu tự động hóa quy trình nghiệp vụ**: Khi Bác sĩ đổi trạng thái cuộc hẹn thành `completed` (Hoàn thành), hệ thống chỉ cập nhật bảng `Appointment` nhưng không tự động sinh bản ghi tương ứng vào bảng `MedicalHistory`.
- **Nguyên nhân 3 - Data Mapping**: Dữ liệu lịch sử khám trả về cho Frontend bị lồng ghép (nested objects), dẫn đến Frontend không lấy được `doctorName`, `visitDate`.
- **Giải pháp**: 
  - Thêm Alias Method cho Interface repository (`getByPatient`, `getByPatientId`, `getById`).
  - Áp dụng Trigger-like behavior tại Application Level: Trong `src/services/appointmentService.js`, bổ sung logic tạo tự động bản ghi `MedicalHistory` (gọi tới `historyRepo.create()`) mỗi khi có sự kiện thay đổi trạng thái thành `completed`.
  - Làm phẳng object dữ liệu lịch sử tại tầng Repository.

---

## 3. PHÁT TRIỂN TÍNH NĂNG MỚI (FEATURE ENHANCEMENTS)

### 3.1. Danh sách bệnh nhân (Admin Portal)
- **Phân tích yêu cầu**: Quản trị viên cần có giao diện để xem và quản lý toàn bộ hồ sơ bệnh nhân.
- **Triển khai**: Hoàn thiện tính năng fetch dữ liệu từ API `/api/v1/patients` và render danh sách bệnh nhân sử dụng DOM manipulation tại file `public/admin/patients.html`.

### 3.2. Hệ thống Email Notification qua Brevo (Sendinblue) API
- **Phân tích yêu cầu**: Chuyển đổi nhà cung cấp gửi email từ SMTP nội bộ/Gmail sang giải pháp chuyên nghiệp Brevo API để đảm bảo tỷ lệ inbox (Deliverability) và tính ổn định của hệ thống.
- **Thiết kế & Triển khai**: 
  - **Facade Pattern**: Cấu trúc lại file `src/helpers/emailHelper.js`, sử dụng API RESTful `v3/smtp/email` của Brevo thay thế cho module `nodemailer`.
  - **Email Templates Builder**: Tạo sẵn các module HTML template chuẩn, có thiết kế responsive UI cho các trường hợp: 
    - `appointmentConfirmed` (Xác nhận lịch)
    - `appointmentCompleted` (Khám xong / Gửi kết quả chẩn đoán)
    - `appointmentReminder` (Nhắc lịch hẹn)
  - **Sự kiện tích hợp**: Kết nối gửi email trực tiếp vào Transaction logic của hàm `updateStatus` trong `appointmentService.js`.

### 3.3. Job Scheduling: Cronjob Nhắc lịch 30 phút
- **Phân tích yêu cầu**: Gửi email nhắc nhở bệnh nhân trước giờ hẹn chính xác 30 phút để giảm tỷ lệ bỏ lịch (No-show rate).
- **Thiết kế Job Scheduler**:
  - Chỉnh sửa module `src/jobs/reminderJob.js` sử dụng thư viện `node-cron`.
  - **Thuật toán Query Window**: Cronjob chạy định kỳ **mỗi phút một lần** (`* * * * *`). Tại mỗi chu kỳ, truy vấn Database các cuộc hẹn chưa gửi nhắc nhở (`reminderSent: false`) và có `startTime` nằm trong cửa sổ thời gian từ 29 - 31 phút tính từ thời điểm hiện tại.
  - Cập nhật Schema: Bổ sung cờ (flag) trạng thái `reminderSent` kiểu Boolean vào mô hình `Appointment.js` để kiểm soát concurrency (ngăn gửi mail trùng lặp).

---

## 4. QUẢN LÝ CẤU HÌNH VÀ TRIỂN KHAI (CONFIGURATION & DEPLOYMENT)

### 4.1. Quản lý biến môi trường (Environment Variables)
- Tách bạch cấu hình API Key của Brevo ra khỏi mã nguồn để đảm bảo bảo mật thông tin (Security Compliance).
- Cập nhật file `.env.example` / `.env` chứa các biến:
  - `BREVO_API_KEY`
  - `MAIL_FROM_EMAIL`
  - `MAIL_FROM_NAME`

### 4.2. Khắc phục sự cố CI/CD (GitHub Push Protection)
- Quá trình Commit & Push lên nhánh `master` bị GitHub chặn lại do phát hiện có rò rỉ API Key trong file `emailHelper.js` (Secret Scanning).
- **Cách xử lý**:
  - Gỡ bỏ hardcode API Key khỏi file JS. Thay thế bằng `process.env.BREVO_API_KEY`.
  - Thực hiện lệnh `git commit --amend` để loại bỏ secret khỏi lịch sử Git cục bộ.
  - Thực hiện `git push origin master --force` để ghi đè lịch sử bảo mật lên Remote Repository, cho phép Railway tiếp tục quá trình Continuous Deployment (CD).

---

## 5. TỔNG KẾT
Toàn bộ các yêu cầu của Khách hàng / Stakeholders đã được đáp ứng 100%. 
1. Hệ thống đã khắc phục xong hoàn toàn các điểm nghẽn về UI/UX trên Frontend (Sự kiện click, render data trống).
2. Quy trình nghiệp vụ về quản lý lịch hẹn (Pending -> Confirmed -> Completed) đã được khép kín tự động (Tự sinh lịch sử khám, tự gửi email).
3. Kiến trúc Micro-services (Giao tiếp API với Third-party Brevo) và Background Jobs (Cronjob nhắc lịch) hoạt động trơn tru.
4. Mã nguồn đảm bảo độ sạch (Clean Code) và bảo mật để sẵn sàng scale trên môi trường Production (Railway).

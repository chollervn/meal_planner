# Tài liệu luồng hoạt động theo kiến trúc MVC - Meal Planner VIP

Tài liệu này mô tả hệ thống theo đúng tư duy MVC (Model - View - Controller), tập trung vào luồng request/response và trách nhiệm của từng tầng.

## 1) Tổng quan kiến trúc MVC của dự án

### Model (M)
- **Entity**: ánh xạ bảng DB, ví dụ `Users`, `Foods`, `MealTemplate`, `MealDetail`, `Schedule`, `ScheduleMeal`.
- **Repository**: truy vấn dữ liệu qua JPA, ví dụ `UsersRepository`, `FoodRepository`, `MealTemplateRepository`, `ScheduleRepository`, `ScheduleMealRepository`.
- **DTO**: object nhận/trả dữ liệu API, ví dụ `LoginRequest`, `UsersCreationRequest`, `MealTemplateRequest`, `ScheduleMealRequest`, `UserResponse`, `ApiResponse`.

### View (V)
- Giao diện HTML/Thymeleaf trong `src/main/resources/templates`.
- CSS/JS trong `src/main/resources/static`.
- Trang chính: login, dashboard, user profile, meal plans, create meal, schedule, admin.

### Controller (C)
- **PageController**: trả view HTML (render trang).
- **REST Controllers**: xử lý API nghiệp vụ:
  - `AuthController`
  - `UsersController`
  - `FoodsController`
  - `MealController`
  - `ScheduleController`
  - `AdminController`

### Service (Business Layer)
- Dù không nằm trong chữ MVC thuần, dự án dùng Service để xử lý nghiệp vụ:
  - `AuthService`, `UsersService`, `FoodService`, `MealTemplateService`, `ScheduleService`.

### Security Layer (cross-cutting)
- `SecurityConfig` + `JwtAuthenticationFilter` + `JwtService`.
- Chặn truy cập và set quyền trước khi vào Controller.

---

## 2) Luồng MVC: Render trang (View flow)

### Luồng chung
1. Trình duyệt gọi route trang, ví dụ `GET /user_profile`.
2. `PageController` nhận request và trả tên template, ví dụ `user_infor`.
3. Thymeleaf trả HTML cho client.
4. JS của trang chạy, gọi API backend để lấy dữ liệu thực.

### Ví dụ
- `GET /admin` -> `PageController.admin()` -> render `adminUI.html`.
- Sau khi trang lên, `admin.js` gọi `/admin/stats`, `/admin/users` để đổ dữ liệu.

---

## 3) Luồng MVC: API đăng nhập và phân quyền JWT

### Bước xử lý
1. View (login form) gửi `POST /auth/login` với email/password.
2. `AuthController.login()` nhận DTO `LoginRequest`.
3. `AuthService.authenticate()` kiểm tra tài khoản + mật khẩu.
4. Nếu hợp lệ, `JwtService.generateToken()` tạo JWT.
5. Controller trả `ApiResponse<UserResponse>` kèm `token`.
6. JS lưu token vào localStorage.
7. Các request API sau đó tự gắn `Authorization: Bearer <token>`.

### Chặn quyền
1. Request vào backend đi qua `JwtAuthenticationFilter`.
2. Filter đọc Bearer token, validate token, lấy role.
3. `SecurityConfig` quyết định quyền truy cập endpoint:
   - `/admin/**` chỉ `ADMIN`.
   - `/users/**`, `/foods/**`, `/meals/**`, `/schedules/**` cần xác thực.

---

## 4) Luồng MVC: User Profile + Upload ảnh đại diện

### A. Xem profile
1. View `user_infor.html` load.
2. JS gọi `GET /users/{userId}`.
3. `UsersController.getUserById()` -> `UsersService.getUserById()` -> `UsersRepository.findById()`.
4. Trả `UserResponse` cho View để hiển thị.

### B. Cập nhật thông tin cá nhân
1. View gửi `PUT /users/{userId}` với `UserUpdateRequest`.
2. Controller nhận request, gọi `UsersService.updateUser()`.
3. Service cập nhật entity, tính lại BMI, lưu DB.
4. Controller trả dữ liệu mới để View cập nhật giao diện.

### C. Upload ảnh từ máy tính
1. View chọn file ảnh, gửi `PUT /users/{userId}/avatar` dạng multipart.
2. `UsersController.updateUserAvatar()` nhận `MultipartFile file`.
3. `UsersService.updateUserAvatar()`:
   - validate loại file (PNG/JPG),
   - validate dung lượng <= 5MB,
   - đọc bytes, encode Base64 Data URL,
   - lưu vào `users.user_image`.
4. Trả `UserResponse` chứa ảnh mới; View render lại avatar.

---

## 5) Luồng MVC: Quản lý Foods

### Tạo food
1. View gửi `POST /foods` với `FoodRequest`.
2. `FoodsController.createFood()` gọi `FoodService.createFood()`.
3. Service map DTO -> entity `Foods`, lưu bằng `FoodRepository.save()`.
4. Trả object food đã tạo.

### Lấy danh sách/tìm kiếm/cập nhật/xóa
- Controller gọi Service tương ứng.
- Service gọi Repository tương ứng.
- View nhận danh sách và render bảng/danh sách chọn món.

### Tính nutrition theo lượng
1. View gọi `GET /foods/{foodId}/nutrition?quantity=...`.
2. Service lấy food và nhân tỷ lệ theo gram.
3. Trả `NutritionResponse`.

---

## 6) Luồng MVC: Tạo và quản lý Meal Template

### Tạo meal
1. View gửi `POST /meals` với `MealTemplateRequest` (mealName, type, bmi range, mealDetails).
2. `MealController.createMeal()` gọi `MealTemplateService.createMealTemplate()`.
3. Service:
   - validate nghiệp vụ (`bmiMin <= bmiMax`),
   - tạo `MealTemplate`,
   - duyệt từng `MealDetailRequest`, lấy food, tạo `MealDetail`,
   - tính tổng calories/protein/fat/fiber/carb,
   - lưu meal + chi tiết.
4. Trả meal đã lưu cho View.

### Cập nhật meal
- Luồng tương tự tạo meal, có bước xóa chi tiết cũ rồi ghi chi tiết mới.

### Xóa meal
- Service xóa `MealDetail` trước, sau đó xóa `MealTemplate` để tránh lỗi ràng buộc.

---

## 7) Luồng MVC: Lập lịch áp thực đơn (Schedule)

### Áp thực đơn vào ngày
1. View gửi `POST /schedules/apply` (`userId`, `mealId`, `date`).
2. `ScheduleController.applyMeal()` gọi `ScheduleService.applyMealToSchedule()`.
3. Service:
   - lấy/tạo schedule của user,
   - kiểm tra meal tồn tại,
   - tạo hoặc update bản ghi schedule meal theo ngày.
4. Trả `ScheduleMeal` để View cập nhật lịch.

### Lấy lịch tuần
1. View gọi `GET /schedules/user/{userId}/week?startDate=...&endDate=...`.
2. Controller -> Service -> Repository query theo khoảng ngày.
3. Trả danh sách để render 7 ngày trong tuần.

### Gỡ lịch ngày
- View gọi `DELETE /schedules/remove?userId=...&date=...`.
- Service xóa bản ghi theo ngày.

---

## 8) Luồng MVC: Admin

### Danh sách user
1. View admin gọi `GET /admin/users`.
2. `AdminController.getAllUsers()` -> `UsersService.getUsersForAdminManagement()`.
3. Service lọc bỏ tài khoản ADMIN.
4. Trả danh sách user cho bảng admin.

### Xem chi tiết user
- `GET /admin/users/{userId}` -> trả `UserResponse` để hiển thị popup chi tiết.

### Xóa user
1. Admin gọi `DELETE /admin/users/{userId}`.
2. `UsersService.deleteUser()` xử lý transactional:
   - chặn xóa account ADMIN,
   - xóa dữ liệu schedule phụ thuộc,
   - xóa user.

### Thống kê
- `GET /admin/stats` trả:
  - tổng user thường,
  - tổng lượt áp thực đơn,
  - user active tuần,
  - meal dùng nhiều nhất.

---

## 9) Quan hệ dữ liệu chính (Model relationships)

- `Users` 1-n `Schedule`.
- `Schedule` 1-n `ScheduleMeal`.
- `MealTemplate` 1-n `MealDetail`.
- `Foods` liên kết với `MealDetail`.
- `ScheduleMeal` liên kết `Schedule` + `MealTemplate` + `date` (khóa tổng hợp).

Mục tiêu của quan hệ này:
- tái sử dụng meal template nhiều ngày,
- thống kê được tần suất sử dụng meal,
- bảo toàn dữ liệu khi xóa theo đúng thứ tự phụ thuộc.

---

## 10) Chuẩn response và xử lý lỗi

### Response chuẩn
```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

### Error handling
- Validation lỗi tại DTO -> trả `success=false` + thông điệp field.
- Nghiệp vụ lỗi tại Service (NotFound, Unauthorized, Conflict, BadRequest).
- `GlobalExceptionHandler` chuẩn hóa lỗi trả về client.

---

## 11) Gợi ý đọc code theo MVC

- **View**: bắt đầu từ `templates/*.html` + `static/js/*.js`.
- **Controller**: xem endpoint ở `controller/*.java`.
- **Service**: đọc nghiệp vụ ở `service/*.java`.
- **Model**: entity + repository + DTO.
- **Security**: `SecurityConfig`, `JwtAuthenticationFilter`, `JwtService`.

Theo thứ tự này bạn sẽ nắm luồng từ UI -> API -> DB rất nhanh.

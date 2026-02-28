# BMI Meal Planner VIP

Ứng dụng quản lý thực đơn cá nhân hóa dựa trên chỉ số BMI.

## Tính năng

- 🔐 Đăng nhập / Đăng ký tài khoản
- 👤 Quản lý thông tin cá nhân và tính toán BMI
- 🍽️ Tạo thực đơn tùy chỉnh theo sở thích
- 📋 Xem các thực đơn mẫu (giảm cân, tăng cân, duy trì)
- 📊 Theo dõi dinh dưỡng và calo
- 📸 Upload ảnh đại diện

## Công nghệ sử dụng

- **Backend**: Java Spring Boot
- **Frontend**: HTML, CSS, JavaScript
- **Build Tool**: Maven

## Cài đặt

1. Clone repository:
```bash
git clone <repository-url>
cd Meal_planner_vip
```

2. Build project:
```bash
./mvnw clean install
```

3. Chạy ứng dụng:
```bash
./mvnw spring-boot:run
```

4. Truy cập: `http://localhost:8080`

## Cấu trúc dự án

```
Meal_planner_vip/
├── src/main/
│   ├── java/com/ronaldo/meal_planner_vip/
│   │   ├── controller/
│   │   └── MealPlannerVipApplication.java
│   └── resources/
│       ├── static/
│       │   ├── css/
│       │   ├── js/
│       │   └── images/
│       └── templates/
├── pom.xml
└── README.md
```

## Tác giả

Ronaldo - BMI Meal Planner VIP

## License

All rights reserved.

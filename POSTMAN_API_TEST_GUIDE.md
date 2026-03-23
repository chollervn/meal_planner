# Postman API Test Guide

Base URL: `http://localhost:8081`

## 0) Authorization
- Public endpoints (no token):
  - `POST /auth/login`
  - `POST /auth/register`
  - `GET /auth/check_email`
  - `POST /auth/reset_password`
- Protected endpoints: add header
  - `Authorization: Bearer <JWT_TOKEN>`

---

## 1) AUTH APIs

### `POST /auth/login`
Body (JSON):
```json
{
  "email": "user@example.com",
  "password": "your_password"
}
```

### `POST /auth/register`
Body (JSON):
```json
{
  "email": "newuser@example.com",
  "password": "12345678",
  "username": "Nguyen Van A",
  "age": 25,
  "heightCm": 170.0,
  "weightKg": 65.0
}
```

### `POST /auth/logout`
Body: none

### `GET /auth/check_email?email=user@example.com`
Body: none

### `POST /auth/reset_password`
Body (JSON):
```json
{
  "email": "user@example.com",
  "newPassword": "newpass123"
}
```

---

## 2) USER APIs

### `GET /users/{userId}`
Body: none

### `GET /users/{userId}/profile`
Body: none

### `PUT /users/{userId}`
Body (JSON, optional fields):
```json
{
  "username": "Nguyen Van A",
  "age": 26,
  "heightCm": 171.0,
  "weightKg": 66.0,
  "userImage": "https://example.com/avatar.jpg"
}
```

### `PUT /users/{userId}/avatar` (upload file from computer)
Body: `form-data`
- key: `file` (type = File)
- value: choose `.png` or `.jpg` (max 5MB)

### `GET /users/{userId}/bmi`
Body: none

### `GET /users/calculate-bmi?heightCm=170&weightKg=65`
Body: none

### Admin-only in `/users` namespace
- `GET /users`
- `GET /users/count`
- `DELETE /users/{userId}`

---

## 3) FOOD APIs

### `POST /foods`
Body (JSON):
```json
{
  "foodName": "Uc ga",
  "calories": 165.0,
  "protein": 31.0,
  "fat": 3.6,
  "fiber": 0.0,
  "carb": 0.0
}
```

### `GET /foods`
### `GET /foods/{foodId}`
### `GET /foods/search?name=ga`
### `DELETE /foods/{foodId}`
Body: none

### `PUT /foods/{foodId}`
Body (JSON, partial allowed):
```json
{
  "foodName": "Uc ga luoc",
  "calories": 160.0,
  "protein": 30.0,
  "fat": 3.0,
  "fiber": 0.0,
  "carb": 0.0
}
```

### `GET /foods/{foodId}/nutrition?quantity=200`
Body: none

---

## 4) MEAL APIs

### `POST /meals`
Body (JSON):
```json
{
  "mealName": "Thuc don tang co",
  "type": "weight_gain",
  "bmiMin": 0.0,
  "bmiMax": 100.0,
  "mealDetails": [
    {
      "foodId": 1,
      "quantity": 200.0,
      "mealTime": "BREAKFAST"
    },
    {
      "foodId": 2,
      "quantity": 150.0,
      "mealTime": "LUNCH"
    },
    {
      "foodId": 3,
      "quantity": 180.0,
      "mealTime": "DINNER"
    }
  ]
}
```

### `PUT /meals/{mealId}`
Body (JSON, partial allowed, same fields as create)

### `DELETE /meals/{mealId}`
Body: none

### `GET /meals`
### `GET /meals/{mealId}`
### `GET /meals/{mealId}/details`
### `GET /meals/{mealId}/nutrition`
### `GET /meals/{mealId}/exists`
### `GET /meals/user/{userId}/recommended`
### `GET /meals/bmi/{bmi}`
### `GET /meals/type/{type}`
### `GET /meals/search?name=com`
Body: none

---

## 5) SCHEDULE APIs

### `POST /schedules/apply`
Body (JSON):
```json
{
  "userId": 2,
  "mealId": 10,
  "date": "2026-03-20"
}
```

### `DELETE /schedules/remove?userId=2&date=2026-03-20`
Body: none

### `GET /schedules/user/{userId}`
### `GET /schedules/user/{userId}/week?startDate=2026-03-16&endDate=2026-03-22`
### `GET /schedules/user/{userId}/date?date=2026-03-20`
### `GET /schedules/stats/most-used`
Body: none

---

## 6) ADMIN APIs (ADMIN token only)

### `GET /admin/users`
### `GET /admin/users/{userId}`
### `DELETE /admin/users/{userId}`
### `GET /admin/stats`
### `GET /admin/stats/meals`
### `GET /admin/stats/users/count`
Body: none

---

## Notes
- `mealTime` only accepts: `BREAKFAST`, `LUNCH`, `DINNER`.
- `type` meal commonly uses: `weight_loss`, `weight_gain`, `maintain`.
- All protected endpoints require `Authorization: Bearer <token>`.

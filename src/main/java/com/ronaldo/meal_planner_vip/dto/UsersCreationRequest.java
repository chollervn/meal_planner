package com.ronaldo.meal_planner_vip.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UsersCreationRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, message = "Mật khẩu tối thiểu 8 ký tự")
    private String password;

    @NotBlank(message = "Tên người dùng không được để trống")
    private String username;

    @NotNull(message = "Tuổi không được để trống")
    @Min(value = 1, message = "Tuổi phải lớn hơn 0")
    @Max(value = 120, message = "Tuổi không hợp lệ")
    private Long age;

    @NotNull(message = "Chiều cao không được để trống")
    @DecimalMin(value = "50.0", message = "Chiều cao tối thiểu là 50 cm")
    @DecimalMax(value = "300.0", message = "Chiều cao không hợp lệ")
    private Float heightCm;

    @NotNull(message = "Cân nặng không được để trống")
    @DecimalMin(value = "10.0", message = "Cân nặng tối thiểu là 10 kg")
    @DecimalMax(value = "500.0", message = "Cân nặng không hợp lệ")
    private Float weightKg;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getAge() {
        return age;
    }

    public void setAge(Long age) {
        this.age = age;
    }

    public Float getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(Float heightCm) {
        this.heightCm = heightCm;
    }

    public Float getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Float weightKg) {
        this.weightKg = weightKg;
    }
}

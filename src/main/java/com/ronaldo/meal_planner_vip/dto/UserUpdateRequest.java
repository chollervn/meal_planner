package com.ronaldo.meal_planner_vip.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    @Size(min = 2, max = 100, message = "Tên người dùng phải từ 2 đến 100 ký tự")
    private String username;

    @Min(value = 1, message = "Tuổi phải lớn hơn 0")
    @Max(value = 110, message = "Tuổi không hợp lệ")
    private Long age;

    @DecimalMin(value = "50.0", message = "Chiều cao tối thiểu là 50 cm")
    @DecimalMax(value = "250.0", message = "Chiều cao không hợp lệ")
    private Float heightCm;

    @DecimalMin(value = "10.0", message = "Cân nặng tối thiểu là 10 kg")
    @DecimalMax(value = "250.0", message = "Cân nặng không hợp lệ")
    private Float weightKg;

    private String userImage;

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

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }
}

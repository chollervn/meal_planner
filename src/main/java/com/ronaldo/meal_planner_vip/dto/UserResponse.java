package com.ronaldo.meal_planner_vip.dto;

public class UserResponse {
    private Integer userId;
    private String email;
    private String username;
    private long age;
    private float heightCm;
    private float weightKg;
    private Float bmi;
    private String userImage;
    private String role;

    public UserResponse() {}

    public UserResponse(Integer userId, String email, String username, long age,
                       float heightCm, float weightKg, Float bmi, String userImage, String role) {
        this.userId = userId;
        this.email = email;
        this.username = username;
        this.age = age;
        this.heightCm = heightCm;
        this.weightKg = weightKg;
        this.bmi = bmi;
        this.userImage = userImage;
        this.role = role;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public long getAge() {
        return age;
    }

    public void setAge(long age) {
        this.age = age;
    }

    public float getHeightCm() {
        return heightCm;
    }

    public void setHeightCm(float heightCm) {
        this.heightCm = heightCm;
    }

    public float getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(float weightKg) {
        this.weightKg = weightKg;
    }

    public Float getBmi() {
        return bmi;
    }

    public void setBmi(Float bmi) {
        this.bmi = bmi;
    }

    public String getUserImage() {
        return userImage;
    }

    public void setUserImage(String userImage) {
        this.userImage = userImage;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

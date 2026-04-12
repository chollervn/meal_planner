package com.ronaldo.meal_planner_vip.dto;

import java.time.LocalDateTime;

public class FoodAdditionRequestResponse {
    private Integer requestId;
    private String foodName;
    private Float calories;
    private Float protein;
    private Float fat;
    private Float fiber;
    private Float carb;
    private String status;
    private Integer requestedByUserId;
    private String requestedByUsername;
    private String requestedByEmail;
    private Integer reviewedByUserId;
    private Integer approvedFoodId;
    private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;

    public Integer getRequestId() {
        return requestId;
    }

    public void setRequestId(Integer requestId) {
        this.requestId = requestId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public Float getCalories() {
        return calories;
    }

    public void setCalories(Float calories) {
        this.calories = calories;
    }

    public Float getProtein() {
        return protein;
    }

    public void setProtein(Float protein) {
        this.protein = protein;
    }

    public Float getFat() {
        return fat;
    }

    public void setFat(Float fat) {
        this.fat = fat;
    }

    public Float getFiber() {
        return fiber;
    }

    public void setFiber(Float fiber) {
        this.fiber = fiber;
    }

    public Float getCarb() {
        return carb;
    }

    public void setCarb(Float carb) {
        this.carb = carb;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(Integer requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
    }

    public String getRequestedByUsername() {
        return requestedByUsername;
    }

    public void setRequestedByUsername(String requestedByUsername) {
        this.requestedByUsername = requestedByUsername;
    }

    public String getRequestedByEmail() {
        return requestedByEmail;
    }

    public void setRequestedByEmail(String requestedByEmail) {
        this.requestedByEmail = requestedByEmail;
    }

    public Integer getReviewedByUserId() {
        return reviewedByUserId;
    }

    public void setReviewedByUserId(Integer reviewedByUserId) {
        this.reviewedByUserId = reviewedByUserId;
    }

    public Integer getApprovedFoodId() {
        return approvedFoodId;
    }

    public void setApprovedFoodId(Integer approvedFoodId) {
        this.approvedFoodId = approvedFoodId;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt) {
        this.reviewedAt = reviewedAt;
    }
}

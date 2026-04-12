package com.ronaldo.meal_planner_vip.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "food_addition_requests")
public class FoodAdditionRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer requestId;

    @Column(name = "food_name", nullable = false, length = 150)
    private String foodName;

    @Column(name = "calories")
    private Float calories;

    @Column(name = "protein")
    private Float protein;

    @Column(name = "fat")
    private Float fat;

    @Column(name = "fiber")
    private Float fiber;

    @Column(name = "carb")
    private Float carb;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FoodAdditionRequestStatus status;

    @Column(name = "requested_by_user_id", nullable = false)
    private Integer requestedByUserId;

    @Column(name = "reviewed_by_user_id")
    private Integer reviewedByUserId;

    @Column(name = "approved_food_id")
    private Integer approvedFoodId;

    @Column(name = "requested_at", nullable = false)
    private LocalDateTime requestedAt;

    @Column(name = "reviewed_at")
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

    public FoodAdditionRequestStatus getStatus() {
        return status;
    }

    public void setStatus(FoodAdditionRequestStatus status) {
        this.status = status;
    }

    public Integer getRequestedByUserId() {
        return requestedByUserId;
    }

    public void setRequestedByUserId(Integer requestedByUserId) {
        this.requestedByUserId = requestedByUserId;
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

package com.ronaldo.meal_planner_vip.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class ScheduleMealRequest {
    @NotNull(message = "userId không được để trống")
    private Integer userId;

    @NotNull(message = "mealId không được để trống")
    private Integer mealId;

    @NotNull(message = "date không được để trống")
    private LocalDate date;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getMealId() {
        return mealId;
    }

    public void setMealId(Integer mealId) {
        this.mealId = mealId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}

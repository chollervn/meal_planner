package com.ronaldo.meal_planner_vip.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class MealDetailRequest {
    @NotNull(message = "foodId không được để trống")
    private Integer foodId;

    @NotNull(message = "Số lượng không được để trống")
    @DecimalMin(value = "1.0", message = "Số lượng phải lớn hơn 0")
    private Float quantity;

    @NotBlank(message = "mealTime không được để trống")
    @Pattern(regexp = "BREAKFAST|LUNCH|DINNER", message = "mealTime chỉ nhận BREAKFAST, LUNCH hoặc DINNER")
    private String mealTime; // BREAKFAST, LUNCH, DINNER

    public Integer getFoodId() {
        return foodId;
    }

    public void setFoodId(Integer foodId) {
        this.foodId = foodId;
    }

    public Float getQuantity() {
        return quantity;
    }

    public void setQuantity(Float quantity) {
        this.quantity = quantity;
    }

    public String getMealTime() {
        return mealTime;
    }

    public void setMealTime(String mealTime) {
        this.mealTime = mealTime;
    }
}

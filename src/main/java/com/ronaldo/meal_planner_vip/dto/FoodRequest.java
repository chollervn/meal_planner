package com.ronaldo.meal_planner_vip.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class FoodRequest {
    @NotBlank(message = "Tên thực phẩm không được để trống")
    @Size(max = 150, message = "Tên thực phẩm quá dài")
    private String foodName;

    @DecimalMin(value = "0.0", message = "Calories không được âm")
    private Float calories;

    @PositiveOrZero(message = "Protein không được âm")
    private Float protein;

    @PositiveOrZero(message = "Fat không được âm")
    private Float fat;

    @PositiveOrZero(message = "Fiber không được âm")
    private Float fiber;

    @PositiveOrZero(message = "Carb không được âm")
    private Float carb;

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

}

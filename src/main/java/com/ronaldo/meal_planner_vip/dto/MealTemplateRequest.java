package com.ronaldo.meal_planner_vip.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public class MealTemplateRequest {
    @NotBlank(message = "Tên thực đơn không được để trống")
    @Size(max = 150, message = "Tên thực đơn quá dài")
    private String mealName;

    @NotBlank(message = "Loại thực đơn không được để trống")
    private String type;

    @NotNull(message = "bmiMin không được để trống")
    @DecimalMin(value = "0.0", message = "bmiMin không hợp lệ")
    @DecimalMax(value = "100.0", message = "bmiMin không hợp lệ")
    private Float bmiMin;

    @NotNull(message = "bmiMax không được để trống")
    @DecimalMin(value = "0.0", message = "bmiMax không hợp lệ")
    @DecimalMax(value = "100.0", message = "bmiMax không hợp lệ")
    private Float bmiMax;

    private String mealImage;

    @Valid
    private List<MealDetailRequest> mealDetails;

    public String getMealName() {
        return mealName;
    }

    public void setMealName(String mealName) {
        this.mealName = mealName;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Float getBmiMin() {
        return bmiMin;
    }

    public void setBmiMin(Float bmiMin) {
        this.bmiMin = bmiMin;
    }

    public Float getBmiMax() {
        return bmiMax;
    }

    public void setBmiMax(Float bmiMax) {
        this.bmiMax = bmiMax;
    }

    public String getMealImage() {
        return mealImage;
    }

    public void setMealImage(String mealImage) {
        this.mealImage = mealImage;
    }

    public List<MealDetailRequest> getMealDetails() {
        return mealDetails;
    }

    public void setMealDetails(List<MealDetailRequest> mealDetails) {
        this.mealDetails = mealDetails;
    }
}

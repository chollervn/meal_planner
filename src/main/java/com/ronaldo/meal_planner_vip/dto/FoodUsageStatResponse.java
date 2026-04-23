package com.ronaldo.meal_planner_vip.dto;

import java.util.ArrayList;
import java.util.List;

public class FoodUsageStatResponse {
    private Integer foodId;
    private String foodName;
    private Long usageCount;
    private List<MealUsageStatResponse> topMeals = new ArrayList<>();

    public FoodUsageStatResponse() {
    }

    public FoodUsageStatResponse(Integer foodId, String foodName, Long usageCount) {
        this.foodId = foodId;
        this.foodName = foodName;
        this.usageCount = usageCount;
    }

    public Integer getFoodId() {
        return foodId;
    }

    public void setFoodId(Integer foodId) {
        this.foodId = foodId;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public Long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Long usageCount) {
        this.usageCount = usageCount;
    }

    public List<MealUsageStatResponse> getTopMeals() {
        return topMeals;
    }

    public void setTopMeals(List<MealUsageStatResponse> topMeals) {
        this.topMeals = topMeals;
    }
}

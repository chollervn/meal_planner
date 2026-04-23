package com.ronaldo.meal_planner_vip.dto;

public class MealUsageStatResponse {
    private Integer mealId;
    private String mealName;
    private Long usageCount;

    public MealUsageStatResponse() {
    }

    public MealUsageStatResponse(Integer mealId, String mealName, Long usageCount) {
        this.mealId = mealId;
        this.mealName = mealName;
        this.usageCount = usageCount;
    }

    public Integer getMealId() {
        return mealId;
    }

    public void setMealId(Integer mealId) {
        this.mealId = mealId;
    }

    public String getMealName() {
        return mealName;
    }

    public void setMealName(String mealName) {
        this.mealName = mealName;
    }

    public Long getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Long usageCount) {
        this.usageCount = usageCount;
    }
}

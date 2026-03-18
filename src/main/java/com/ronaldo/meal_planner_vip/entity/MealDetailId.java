package com.ronaldo.meal_planner_vip.entity;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class MealDetailId implements Serializable {
    @Column(name = "idmf")
    private Integer idmf;

    @Column(name = "food_id")
    private Integer foodId;

    @Column(name = "meal_time")
    private String mealTime;

    public MealDetailId() {}

    public MealDetailId(Integer idmf, Integer foodId, String mealTime) {
        this.idmf = idmf;
        this.foodId = foodId;
        this.mealTime = mealTime;
    }

    public Integer getIdmf() {
        return idmf;
    }

    public void setIdmf(Integer idmf) {
        this.idmf = idmf;
    }

    public Integer getFoodId() {
        return foodId;
    }

    public void setFoodId(Integer foodId) {
        this.foodId = foodId;
    }

    public String getMealTime() {
        return mealTime;
    }

    public void setMealTime(String mealTime) {
        this.mealTime = mealTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MealDetailId that = (MealDetailId) o;
        return Objects.equals(idmf, that.idmf)
                && Objects.equals(foodId, that.foodId)
                && Objects.equals(mealTime, that.mealTime);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idmf, foodId, mealTime);
    }
}

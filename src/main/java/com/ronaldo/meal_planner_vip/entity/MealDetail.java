package com.ronaldo.meal_planner_vip.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.util.Locale;

@Entity
@Table(name = "meal_details")
public class MealDetail {
    @EmbeddedId
    private MealDetailId id;

    @ManyToOne
    @MapsId("idmf")
    @JoinColumn(name = "idmf")
    @JsonIgnore
    private MealTemplate mealTemplate;

    @ManyToOne
    @MapsId("foodId")
    @JoinColumn(name = "food_id")
    private Foods food;

    @Column(name = "quantity")
    private Float quantity;

    public enum MealTime {
        BREAKFAST, LUNCH, DINNER
    }

    // Getters and Setters
    public MealDetailId getId() {
        return id;
    }

    public void setId(MealDetailId id) {
        this.id = id;
    }

    public MealTemplate getMealTemplate() {
        return mealTemplate;
    }

    public void setMealTemplate(MealTemplate mealTemplate) {
        this.mealTemplate = mealTemplate;
        if (this.id == null) {
            this.id = new MealDetailId();
        }
        if (mealTemplate != null) {
            this.id.setIdmf(mealTemplate.getIdmf());
        }
    }

    public Foods getFood() {
        return food;
    }

    public void setFood(Foods food) {
        this.food = food;
        if (this.id == null) {
            this.id = new MealDetailId();
        }
        if (food != null) {
            this.id.setFoodId(food.getFoodId());
        }
    }

    public Float getQuantity() {
        return quantity;
    }

    public void setQuantity(Float quantity) {
        this.quantity = quantity;
    }

    public MealTime getMealTime() {
        if (id == null || id.getMealTime() == null) {
            return null;
        }

        return MealTime.valueOf(id.getMealTime().trim().toUpperCase(Locale.ROOT));
    }

    public void setMealTime(MealTime mealTime) {
        if (this.id == null) {
            this.id = new MealDetailId();
        }

        this.id.setMealTime(mealTime == null ? null : mealTime.name().toLowerCase(Locale.ROOT));
    }
}

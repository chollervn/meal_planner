package com.ronaldo.meal_planner_vip.dto;

public class NutritionResponse {
    private Float totalCalo;
    private Float totalProtein;
    private Float totalFat;
    private Float totalFiber;
    private Float totalCarb;

    public NutritionResponse() {}

    public NutritionResponse(Float totalCalo, Float totalProtein, Float totalFat, Float totalFiber, Float totalCarb) {
        this.totalCalo = totalCalo;
        this.totalProtein = totalProtein;
        this.totalFat = totalFat;
        this.totalFiber = totalFiber;
        this.totalCarb = totalCarb;
    }

    public Float getTotalCalo() {
        return totalCalo;
    }

    public void setTotalCalo(Float totalCalo) {
        this.totalCalo = totalCalo;
    }

    public Float getTotalProtein() {
        return totalProtein;
    }

    public void setTotalProtein(Float totalProtein) {
        this.totalProtein = totalProtein;
    }

    public Float getTotalFat() {
        return totalFat;
    }

    public void setTotalFat(Float totalFat) {
        this.totalFat = totalFat;
    }

    public Float getTotalFiber() {
        return totalFiber;
    }

    public void setTotalFiber(Float totalFiber) {
        this.totalFiber = totalFiber;
    }

    public Float getTotalCarb() {
        return totalCarb;
    }

    public void setTotalCarb(Float totalCarb) {
        this.totalCarb = totalCarb;
    }
}

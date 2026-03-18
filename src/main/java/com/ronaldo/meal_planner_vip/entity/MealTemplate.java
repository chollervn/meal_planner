package com.ronaldo.meal_planner_vip.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "meal_template")
public class MealTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idmf")
    private Integer idmf;

    @Column(name = "meal_name")
    private String mealName;

    @Column(name = "meal_type")
    private String type; // weight_loss, weight_gain, maintain

    @Column(name = "calo")
    private Float calo;

    @Column(name = "fat")
    private Float fat;

    @Column(name = "fiber")
    private Float fiber;

    @Column(name = "protein")
    private Float protein;

    @Column(name = "carb")
    private Float carb;

    @Column(name = "bmi_min")
    private Float bmiMin;

    @Column(name = "bmi_max")
    private Float bmiMax;

    @Column(name = "meal_image")
    private String mealImage;

    @OneToMany(mappedBy = "mealTemplate", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<MealDetail> mealDetails;

    // Getters and Setters
    public Integer getIdmf() {
        return idmf;
    }

    public void setIdmf(Integer idmf) {
        this.idmf = idmf;
    }

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

    public Float getCalo() {
        return calo;
    }

    public void setCalo(Float calo) {
        this.calo = calo;
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

    public Float getProtein() {
        return protein;
    }

    public void setProtein(Float protein) {
        this.protein = protein;
    }

    public Float getCarb() {
        return carb;
    }

    public void setCarb(Float carb) {
        this.carb = carb;
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

    public List<MealDetail> getMealDetails() {
        return mealDetails;
    }

    public void setMealDetails(List<MealDetail> mealDetails) {
        this.mealDetails = mealDetails;
    }
}

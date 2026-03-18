package com.ronaldo.meal_planner_vip.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "schedule_meal")
public class ScheduleMeal {
    @EmbeddedId
    private ScheduleMealId id;

    @ManyToOne
    @MapsId("scheduleId")
    @JoinColumn(name = "schedule_id")
    @JsonIgnore
    private Schedule schedule;

    @ManyToOne
    @MapsId("idmf")
    @JoinColumn(name = "idmf")
    private MealTemplate mealTemplate;

    // Getters and Setters
    public ScheduleMealId getId() {
        return id;
    }

    public void setId(ScheduleMealId id) {
        this.id = id;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
        if (this.id == null) {
            this.id = new ScheduleMealId();
        }
        if (schedule != null) {
            this.id.setScheduleId(schedule.getScheduleId());
        }
    }

    public MealTemplate getMealTemplate() {
        return mealTemplate;
    }

    public void setMealTemplate(MealTemplate mealTemplate) {
        this.mealTemplate = mealTemplate;
        if (this.id == null) {
            this.id = new ScheduleMealId();
        }
        if (mealTemplate != null) {
            this.id.setIdmf(mealTemplate.getIdmf());
        }
    }

    public LocalDate getDate() {
        if (id == null) {
            return null;
        }
        return id.getDate();
    }

    public void setDate(LocalDate date) {
        if (this.id == null) {
            this.id = new ScheduleMealId();
        }
        this.id.setDate(date);
    }
}

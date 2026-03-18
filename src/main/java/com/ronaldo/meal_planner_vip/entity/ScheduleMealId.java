package com.ronaldo.meal_planner_vip.entity;

import jakarta.persistence.Embeddable;

import java.time.LocalDate;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ScheduleMealId implements Serializable {
    private Integer scheduleId;
    private Integer idmf;
    private LocalDate date;

    public ScheduleMealId() {}

    public ScheduleMealId(Integer scheduleId, Integer idmf, LocalDate date) {
        this.scheduleId = scheduleId;
        this.idmf = idmf;
        this.date = date;
    }

    public Integer getScheduleId() {
        return scheduleId;
    }

    public void setScheduleId(Integer scheduleId) {
        this.scheduleId = scheduleId;
    }

    public Integer getIdmf() {
        return idmf;
    }

    public void setIdmf(Integer idmf) {
        this.idmf = idmf;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        ScheduleMealId that = (ScheduleMealId) o;
        return Objects.equals(scheduleId, that.scheduleId)
                && Objects.equals(idmf, that.idmf)
                && Objects.equals(date, that.date);
    }

    @Override
    public int hashCode() {
        return Objects.hash(scheduleId, idmf, date);
    }
}

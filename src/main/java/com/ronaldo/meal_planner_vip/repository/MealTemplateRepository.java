package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.MealTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealTemplateRepository extends JpaRepository<MealTemplate, Integer> {
    List<MealTemplate> findByType(String type);

    @Query("SELECT m FROM MealTemplate m WHERE :bmi BETWEEN m.bmiMin AND m.bmiMax")
    List<MealTemplate> findByBmiRange(@Param("bmi") Float bmi);

    @Query("SELECT m FROM MealTemplate m WHERE m.bmiMin <= :bmi AND m.bmiMax >= :bmi")
    List<MealTemplate> findMealsByUserBmi(@Param("bmi") Float bmi);

    List<MealTemplate> findByMealNameContainingIgnoreCase(String mealName);
}

package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.Foods;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodRepository extends JpaRepository<Foods, Integer> {
    List<Foods> findByFoodNameContainingIgnoreCase(String foodName);
}

package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.MealDetail;
import com.ronaldo.meal_planner_vip.entity.MealDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MealDetailRepository extends JpaRepository<MealDetail, MealDetailId> {
    List<MealDetail> findByMealTemplateIdmf(Integer idmf);
    List<MealDetail> findByFoodFoodId(Integer foodId);
    void deleteByMealTemplateIdmf(Integer idmf);
}

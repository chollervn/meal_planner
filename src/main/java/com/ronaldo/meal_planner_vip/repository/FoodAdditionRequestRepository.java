package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.FoodAdditionRequest;
import com.ronaldo.meal_planner_vip.entity.FoodAdditionRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodAdditionRequestRepository extends JpaRepository<FoodAdditionRequest, Integer> {
    List<FoodAdditionRequest> findByRequestedByUserIdOrderByRequestedAtDesc(Integer requestedByUserId);

    List<FoodAdditionRequest> findByStatusOrderByRequestedAtDesc(FoodAdditionRequestStatus status);

    List<FoodAdditionRequest> findAllByOrderByRequestedAtDesc();
}

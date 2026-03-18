package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {
    Optional<Schedule> findByUserUserId(Integer userId);
}

package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.ScheduleMeal;
import com.ronaldo.meal_planner_vip.entity.ScheduleMealId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ScheduleMealRepository extends JpaRepository<ScheduleMeal, ScheduleMealId> {
    List<ScheduleMeal> findByScheduleScheduleId(Integer scheduleId);

    @Query("SELECT sm FROM ScheduleMeal sm WHERE sm.schedule.scheduleId = :scheduleId AND sm.id.date = :date")
    Optional<ScheduleMeal> findByScheduleIdAndDate(@Param("scheduleId") Integer scheduleId, @Param("date") LocalDate date);

    @Query("SELECT sm FROM ScheduleMeal sm WHERE sm.schedule.scheduleId = :scheduleId AND sm.id.date BETWEEN :startDate AND :endDate")
    List<ScheduleMeal> findByScheduleIdAndDateBetween(@Param("scheduleId") Integer scheduleId,
                                                       @Param("startDate") LocalDate startDate,
                                                       @Param("endDate") LocalDate endDate);

    @Query("DELETE FROM ScheduleMeal sm WHERE sm.schedule.scheduleId = :scheduleId AND sm.id.date = :date")
    @org.springframework.data.jpa.repository.Modifying
    void deleteByScheduleScheduleIdAndDate(@Param("scheduleId") Integer scheduleId, @Param("date") LocalDate date);

    @Query("SELECT sm.mealTemplate.idmf, COUNT(sm) as usageCount FROM ScheduleMeal sm GROUP BY sm.mealTemplate.idmf ORDER BY usageCount DESC")
    List<Object[]> findMostUsedMeals();

    @Query("SELECT sm.mealTemplate.idmf, sm.mealTemplate.mealName, COUNT(sm) as usageCount FROM ScheduleMeal sm GROUP BY sm.mealTemplate.idmf, sm.mealTemplate.mealName ORDER BY usageCount DESC")
    List<Object[]> findMostUsedMealsWithName();

    @Query("SELECT COUNT(sm) FROM ScheduleMeal sm")
    long countAppliedMeals();

    @Query("SELECT COUNT(DISTINCT sm.schedule.user.userId) FROM ScheduleMeal sm " +
            "WHERE sm.id.date BETWEEN :startDate AND :endDate " +
            "AND UPPER(COALESCE(sm.schedule.user.role, 'USER')) <> 'ADMIN'")
    long countActiveUsersByDateRange(@Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);

    @Query(value = "SELECT md.food_id AS foodId, f.food_name AS foodName, COUNT(*) AS usageCount " +
            "FROM schedule_meal sm " +
            "JOIN (SELECT DISTINCT idmf, food_id FROM meal_details) md ON md.idmf = sm.idmf " +
            "JOIN foods f ON f.food_id = md.food_id " +
            "GROUP BY md.food_id, f.food_name " +
            "ORDER BY usageCount DESC, md.food_id ASC",
            nativeQuery = true)
    List<Object[]> findMostUsedFoods();

    @Query(value = "SELECT sm.idmf AS mealId, mt.meal_name AS mealName, COUNT(*) AS usageCount " +
            "FROM schedule_meal sm " +
            "JOIN meal_template mt ON mt.idmf = sm.idmf " +
            "WHERE sm.idmf IN (SELECT DISTINCT md.idmf FROM meal_details md WHERE md.food_id = :foodId) " +
            "GROUP BY sm.idmf, mt.meal_name " +
            "ORDER BY usageCount DESC, sm.idmf ASC",
            nativeQuery = true)
    List<Object[]> findTopMealsContainingFood(@Param("foodId") Integer foodId);
}

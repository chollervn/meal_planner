package com.ronaldo.meal_planner_vip.service;

import com.ronaldo.meal_planner_vip.dto.ScheduleMealRequest;
import com.ronaldo.meal_planner_vip.entity.*;
import com.ronaldo.meal_planner_vip.exception.ResourceNotFoundException;
import com.ronaldo.meal_planner_vip.repository.MealTemplateRepository;
import com.ronaldo.meal_planner_vip.repository.ScheduleMealRepository;
import com.ronaldo.meal_planner_vip.repository.ScheduleRepository;
import com.ronaldo.meal_planner_vip.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Service
public class ScheduleService {
    @Autowired
    private ScheduleRepository scheduleRepository;

    @Autowired
    private ScheduleMealRepository scheduleMealRepository;

    @Autowired
    private MealTemplateRepository mealTemplateRepository;

    @Autowired
    private UsersRepository usersRepository;

    // Lấy hoặc tạo schedule cho user
    public Schedule getOrCreateSchedule(Integer userId) {
        Optional<Schedule> existingSchedule = scheduleRepository.findByUserUserId(userId);

        if (existingSchedule.isPresent()) {
            return existingSchedule.get();
        }

        // Tạo schedule mới cho user
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại: " + userId));

        Schedule schedule = new Schedule();
        schedule.setUser(user);
        return scheduleRepository.save(schedule);
    }

    // Lấy schedule theo user ID
    public Schedule getScheduleByUserId(Integer userId) {
        return scheduleRepository.findByUserUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy schedule cho user: " + userId));
    }

    // Áp dụng meal vào lịch
    @Transactional
    public ScheduleMeal applyMealToSchedule(ScheduleMealRequest request) {
        // Lấy hoặc tạo schedule cho user
        Schedule schedule = getOrCreateSchedule(request.getUserId());

        // Kiểm tra meal tồn tại
        MealTemplate meal = mealTemplateRepository.findById(request.getMealId())
                .orElseThrow(() -> new ResourceNotFoundException("Meal không tồn tại: " + request.getMealId()));

        // Kiểm tra xem ngày đó đã có meal chưa, nếu có thì cập nhật
        Optional<ScheduleMeal> existingMeal = scheduleMealRepository
                .findByScheduleIdAndDate(schedule.getScheduleId(), request.getDate());

        ScheduleMeal scheduleMeal;
        if (existingMeal.isPresent()) {
            // Cập nhật meal cho ngày đó
            scheduleMeal = existingMeal.get();
            scheduleMeal.setMealTemplate(meal);
            scheduleMeal.setDate(request.getDate());
            // Cập nhật ID để đảm bảo consistency
            if (scheduleMeal.getId() == null) {
                scheduleMeal.setId(new ScheduleMealId(schedule.getScheduleId(), meal.getIdmf(), request.getDate()));
            }
        } else {
            // Tạo mới
            scheduleMeal = new ScheduleMeal();
            ScheduleMealId id = new ScheduleMealId(schedule.getScheduleId(), meal.getIdmf(), request.getDate());
            scheduleMeal.setId(id);
            scheduleMeal.setSchedule(schedule);
            scheduleMeal.setMealTemplate(meal);
            scheduleMeal.setDate(request.getDate());
        }

        return scheduleMealRepository.save(scheduleMeal);
    }

    // Gỡ meal khỏi lịch
    @Transactional
    public void removeMealFromSchedule(Integer userId, LocalDate date) {
        Schedule schedule = getScheduleByUserId(userId);
        scheduleMealRepository.deleteByScheduleScheduleIdAndDate(schedule.getScheduleId(), date);
    }

    // Lấy tất cả meals trong schedule của user
    public List<ScheduleMeal> getScheduleMeals(Integer userId) {
        Schedule schedule = getOrCreateSchedule(userId);
        return scheduleMealRepository.findByScheduleScheduleId(schedule.getScheduleId());
    }

    // Lấy meals trong khoảng thời gian (tuần)
    public List<ScheduleMeal> getScheduleMealsByDateRange(Integer userId, LocalDate startDate, LocalDate endDate) {
        Schedule schedule = getOrCreateSchedule(userId);
        return scheduleMealRepository.findByScheduleIdAndDateBetween(
                schedule.getScheduleId(), startDate, endDate);
    }

    // Lấy meal của một ngày cụ thể
    public ScheduleMeal getMealByDate(Integer userId, LocalDate date) {
        Schedule schedule = getOrCreateSchedule(userId);
        return scheduleMealRepository.findByScheduleIdAndDate(schedule.getScheduleId(), date)
                .orElse(null);
    }

    // Thống kê: Thực đơn được sử dụng nhiều nhất
    public List<Object[]> getMostUsedMeals() {
        return scheduleMealRepository.findMostUsedMeals();
    }

    public List<Object[]> getMostUsedMealsWithName() {
        return scheduleMealRepository.findMostUsedMealsWithName();
    }

    public long countAppliedMeals() {
        return scheduleMealRepository.countAppliedMeals();
    }

    public long countActiveUsersThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate endOfWeek = startOfWeek.plusDays(6);
        return scheduleMealRepository.countActiveUsersByDateRange(startOfWeek, endOfWeek);
    }
}

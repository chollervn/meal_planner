package com.ronaldo.meal_planner_vip.service;

import com.ronaldo.meal_planner_vip.dto.MealDetailRequest;
import com.ronaldo.meal_planner_vip.dto.MealTemplateRequest;
import com.ronaldo.meal_planner_vip.dto.NutritionResponse;
import com.ronaldo.meal_planner_vip.entity.*;
import com.ronaldo.meal_planner_vip.exception.BadRequestException;
import com.ronaldo.meal_planner_vip.exception.ResourceNotFoundException;
import com.ronaldo.meal_planner_vip.repository.FoodRepository;
import com.ronaldo.meal_planner_vip.repository.MealDetailRepository;
import com.ronaldo.meal_planner_vip.repository.MealTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class MealTemplateService {
    @Autowired
    private MealTemplateRepository mealTemplateRepository;

    @Autowired
    private MealDetailRepository mealDetailRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UsersService usersService;

    // Tạo meal template mới
    @Transactional
    public MealTemplate createMealTemplate(MealTemplateRequest request) {
        if (request.getBmiMin() > request.getBmiMax()) {
            throw new BadRequestException("bmiMin không được lớn hơn bmiMax");
        }

        MealTemplate meal = new MealTemplate();
        meal.setMealName(request.getMealName());
        meal.setType(request.getType());
        meal.setBmiMin(request.getBmiMin());
        meal.setBmiMax(request.getBmiMax());
        meal.setMealImage(request.getMealImage());

        // Tính tổng dinh dưỡng từ danh sách foods
        Float totalCalo = 0f, totalProtein = 0f, totalFat = 0f, totalFiber = 0f, totalCarb = 0f;
        meal.setCalo(totalCalo);
        meal.setCarb(totalCarb);
        meal.setFiber(totalFiber);
        meal.setFat(totalFat);
        meal.setProtein(totalProtein);
        // Lưu meal trước để có ID
        meal = mealTemplateRepository.save(meal);

        // Thêm chi tiết thực đơn
        if (request.getMealDetails() != null && !request.getMealDetails().isEmpty()) {
            List<MealDetail> mealDetails = new ArrayList<>();

            for (MealDetailRequest detailRequest : request.getMealDetails()) {
                Foods food = foodRepository.findById(detailRequest.getFoodId())
                        .orElseThrow(() -> new ResourceNotFoundException("Food không tồn tại: " + detailRequest.getFoodId()));

                MealDetail detail = new MealDetail();
                MealDetailId detailId = new MealDetailId(
                        meal.getIdmf(),
                        food.getFoodId(),
                        detailRequest.getMealTime().toLowerCase(Locale.ROOT)
                );
                detail.setId(detailId);
                detail.setMealTemplate(meal);
                detail.setFood(food);
                detail.setQuantity(detailRequest.getQuantity());
                try {
                    detail.setMealTime(MealDetail.MealTime.valueOf(detailRequest.getMealTime()));
                } catch (IllegalArgumentException exception) {
                    throw new BadRequestException("mealTime không hợp lệ");
                }

                mealDetails.add(detail);

                // Tính dinh dưỡng
                float ratio = detailRequest.getQuantity() / 100f;
                totalCalo += food.getCalories() * ratio;
                totalProtein += food.getProtein() * ratio;
                totalFat += food.getFat() * ratio;
                totalFiber += food.getFiber() * ratio;
                totalCarb += food.getCarb() * ratio;
            }

            mealDetailRepository.saveAll(mealDetails);
        }

        // Cập nhật tổng dinh dưỡng
        meal.setCalo(totalCalo);
        meal.setProtein(totalProtein);
        meal.setFat(totalFat);
        meal.setFiber(totalFiber);
        meal.setCarb(totalCarb);

        return mealTemplateRepository.save(meal);
    }

    // Lấy tất cả meal templates
    public List<MealTemplate> getAllMealTemplates() {
        return mealTemplateRepository.findAll();
    }

    // Lấy meal template theo ID
    public MealTemplate getMealTemplateById(Integer id) {
        return mealTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy meal template với ID: " + id));
    }

    // Lấy chi tiết meal (bao gồm danh sách food)
    public MealTemplate getMealDetail(Integer mealId) {
        MealTemplate meal = getMealTemplateById(mealId);
        // Lazy loading sẽ load mealDetails
        return meal;
    }

    // Lấy danh sách chi tiết thực đơn
    public List<MealDetail> getMealDetails(Integer mealId) {
        return mealDetailRepository.findByMealTemplateIdmf(mealId);
    }

    // Lấy meal templates theo BMI của user
    public List<MealTemplate> getMealsByUserBmi(Integer userId) {
        Float bmi = usersService.getUserBMI(userId);
        return mealTemplateRepository.findMealsByUserBmi(bmi);
    }

    // Lấy meal templates theo BMI range
    public List<MealTemplate> getMealsByBmiRange(Float bmi) {
        return mealTemplateRepository.findByBmiRange(bmi);
    }

    // Lấy meal templates theo type
    public List<MealTemplate> getMealsByType(String type) {
        return mealTemplateRepository.findByType(type);
    }

    // Tìm kiếm meal theo tên
    public List<MealTemplate> searchMealByName(String name) {
        return mealTemplateRepository.findByMealNameContainingIgnoreCase(name);
    }

    // Cập nhật meal template
    @Transactional
    public MealTemplate updateMealTemplate(Integer mealId, MealTemplateRequest request) {
        MealTemplate meal = getMealTemplateById(mealId);

        if (request.getMealName() != null) {
            meal.setMealName(request.getMealName());
        }
        if (request.getType() != null) {
            meal.setType(request.getType());
        }
        if (request.getBmiMin() != null) {
            meal.setBmiMin(request.getBmiMin());
        }
        if (request.getBmiMax() != null) {
            meal.setBmiMax(request.getBmiMax());
        }
        if (request.getMealImage() != null) {
            meal.setMealImage(request.getMealImage());
        }

        if (meal.getBmiMin() != null && meal.getBmiMax() != null && meal.getBmiMin() > meal.getBmiMax()) {
            throw new BadRequestException("bmiMin không được lớn hơn bmiMax");
        }

        // Nếu có cập nhật chi tiết thực đơn
        if (request.getMealDetails() != null && !request.getMealDetails().isEmpty()) {
            // Xóa chi tiết cũ
            mealDetailRepository.deleteByMealTemplateIdmf(mealId);

            Float totalCalo = 0f, totalProtein = 0f, totalFat = 0f, totalFiber = 0f, totalCarb = 0f;
            List<MealDetail> mealDetails = new ArrayList<>();

            for (MealDetailRequest detailRequest : request.getMealDetails()) {
                Foods food = foodRepository.findById(detailRequest.getFoodId())
                        .orElseThrow(() -> new ResourceNotFoundException("Food không tồn tại: " + detailRequest.getFoodId()));

                MealDetail detail = new MealDetail();
                MealDetailId detailId = new MealDetailId(
                        meal.getIdmf(),
                        food.getFoodId(),
                        detailRequest.getMealTime().toLowerCase(Locale.ROOT)
                );
                detail.setId(detailId);
                detail.setMealTemplate(meal);
                detail.setFood(food);
                detail.setQuantity(detailRequest.getQuantity());
                try {
                    detail.setMealTime(MealDetail.MealTime.valueOf(detailRequest.getMealTime()));
                } catch (IllegalArgumentException exception) {
                    throw new BadRequestException("mealTime không hợp lệ");
                }

                mealDetails.add(detail);

                float ratio = detailRequest.getQuantity() / 100f;
                totalCalo += food.getCalories() * ratio;
                totalProtein += food.getProtein() * ratio;
                totalFat += food.getFat() * ratio;
                totalFiber += food.getFiber() * ratio;
                totalCarb += food.getCarb() * ratio;
            }

            mealDetailRepository.saveAll(mealDetails);

            meal.setCalo(totalCalo);
            meal.setProtein(totalProtein);
            meal.setFat(totalFat);
            meal.setFiber(totalFiber);
            meal.setCarb(totalCarb);
        }

        return mealTemplateRepository.save(meal);
    }

    // Xóa meal template
    @Transactional
    public void deleteMealTemplate(Integer mealId) {
        if (!mealTemplateRepository.existsById(mealId)) {
            throw new ResourceNotFoundException("Không tìm thấy meal template với ID: " + mealId);
        }
        mealDetailRepository.deleteByMealTemplateIdmf(mealId);
        mealTemplateRepository.deleteById(mealId);
    }

    // Kiểm tra meal tồn tại
    public boolean checkMealExists(Integer mealId) {
        return mealTemplateRepository.existsById(mealId);
    }

    // Tính tổng dinh dưỡng của meal
    public NutritionResponse calculateMealNutrition(Integer mealId) {
        MealTemplate meal = getMealTemplateById(mealId);
        return new NutritionResponse(
            meal.getCalo(),
            meal.getProtein(),
            meal.getFat(),
            meal.getFiber(),
            meal.getCarb()
        );
    }
}

package com.ronaldo.meal_planner_vip.service;

import com.ronaldo.meal_planner_vip.dto.FoodRequest;
import com.ronaldo.meal_planner_vip.dto.NutritionResponse;
import com.ronaldo.meal_planner_vip.entity.Foods;
import com.ronaldo.meal_planner_vip.exception.BadRequestException;
import com.ronaldo.meal_planner_vip.exception.ResourceNotFoundException;
import com.ronaldo.meal_planner_vip.repository.FoodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FoodService {
    @Autowired
    private FoodRepository foodRepository;

    // Tạo food mới
    public Foods createFood(FoodRequest request) {
        Foods food = new Foods();
        food.setFoodName(request.getFoodName());
        food.setCalories(request.getCalories());
        food.setProtein(request.getProtein());
        food.setFat(request.getFat());
        food.setFiber(request.getFiber());
        food.setCarb(request.getCarb());

        return foodRepository.save(food);
    }

    // Lấy tất cả foods
    public List<Foods> getAllFoods() {
        return foodRepository.findAll();
    }

    // Lấy food theo ID
    public Foods getFoodById(Integer foodId) {
        return foodRepository.findById(foodId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy food với ID: " + foodId));
    }

    // Tìm kiếm food theo tên
    public List<Foods> searchFoodByName(String name) {
        return foodRepository.findByFoodNameContainingIgnoreCase(name);
    }

    // Cập nhật food
    public Foods updateFood(Integer foodId, FoodRequest request) {
        Foods food = getFoodById(foodId);

        if (request.getFoodName() != null) {
            food.setFoodName(request.getFoodName());
        }
        if (request.getCalories() != null) {
            food.setCalories(request.getCalories());
        }
        if (request.getProtein() != null) {
            food.setProtein(request.getProtein());
        }
        if (request.getFat() != null) {
            food.setFat(request.getFat());
        }
        if (request.getFiber() != null) {
            food.setFiber(request.getFiber());
        }
        if (request.getCarb() != null) {
            food.setCarb(request.getCarb());
        }
        return foodRepository.save(food);
    }

    // Xóa food
    public void deleteFood(Integer foodId) {
        if (!foodRepository.existsById(foodId)) {
            throw new ResourceNotFoundException("Không tìm thấy food với ID: " + foodId);
        }
        foodRepository.deleteById(foodId);
    }

    // Tính dinh dưỡng theo số lượng (gram)
    public NutritionResponse calculateNutrition(Integer foodId, Float quantity) {
        if (quantity == null || quantity <= 0) {
            throw new BadRequestException("quantity phải lớn hơn 0");
        }

        Foods food = getFoodById(foodId);

        float ratio = quantity / 100f;

        return new NutritionResponse(
            food.getCalories() * ratio,
            food.getProtein() * ratio,
            food.getFat() * ratio,
            food.getFiber() * ratio,
            food.getCarb() * ratio
        );
    }
}

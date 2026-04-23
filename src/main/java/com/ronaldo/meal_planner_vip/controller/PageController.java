package com.ronaldo.meal_planner_vip.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping({"/", "/login"})
    public String login() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/user_profile")
    public String userProfile() {
        return "user_infor";
    }

    @GetMapping("/my_meals")
    public String myMeals() {
        return "my_meal";
    }

    @GetMapping("/meal_plans")
    public String mealPlans() {
        return "meal_plan";
    }

    @GetMapping("/create_meal")
    public String createMeal() {
        return "create";
    }

    @GetMapping("/meal_detail")
    public String mealDetail() {
        return "detail_meal";
    }

    @GetMapping("/admin")
    public String admin() {
        return "adminUI";
    }

    @GetMapping("/admin_food_requests")
    public String adminFoodRequests() {
        return "admin_food_requests";
    }

    @GetMapping("/admin_food_stats")
    public String adminFoodStats() {
        return "admin_food_stats";
    }
}

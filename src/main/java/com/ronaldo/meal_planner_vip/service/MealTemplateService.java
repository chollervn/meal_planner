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
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

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

                float quantityInGrams = normalizeQuantityToGrams(detailRequest.getQuantity());

                MealDetail detail = new MealDetail();
                MealDetailId detailId = new MealDetailId(
                        meal.getIdmf(),
                        food.getFoodId(),
                        detailRequest.getMealTime().toLowerCase(Locale.ROOT)
                );
                detail.setId(detailId);
                detail.setMealTemplate(meal);
                detail.setFood(food);
                detail.setQuantity(quantityInGrams);
                try {
                    detail.setMealTime(MealDetail.MealTime.valueOf(detailRequest.getMealTime()));
                } catch (IllegalArgumentException exception) {
                    throw new BadRequestException("mealTime không hợp lệ");
                }

                mealDetails.add(detail);

                // Tính dinh dưỡng
                float ratio = quantityInGrams / 100f;
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
    @Transactional
    public List<MealTemplate> getAllMealTemplates() {
        List<MealTemplate> meals = mealTemplateRepository.findAll();
        meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
        return meals;
    }

    // Lấy meal template theo ID
    @Transactional
    public MealTemplate getMealTemplateById(Integer id) {
        MealTemplate meal = mealTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy meal template với ID: " + id));
        syncMealNutritionFromDetails(meal, true);
        return meal;
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
    @Transactional
    public List<MealTemplate> getMealsByUserBmi(Integer userId) {
        Float bmi = usersService.getUserBMI(userId);
        List<MealTemplate> meals = mealTemplateRepository.findMealsByUserBmi(bmi);
        meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
        return meals;
    }

    // Lấy meal templates theo BMI range
    @Transactional
    public List<MealTemplate> getMealsByBmiRange(Float bmi) {
        List<MealTemplate> meals = mealTemplateRepository.findByBmiRange(bmi);
        meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
        return meals;
    }

    // Lấy meal templates theo type
    @Transactional
    public List<MealTemplate> getMealsByType(String type) {
        List<MealTemplate> meals = mealTemplateRepository.findByType(type);
        meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
        return meals;
    }

    // Tìm kiếm meal theo tên
    @Transactional
    public List<MealTemplate> searchMealByName(String name) {
        List<MealTemplate> meals = mealTemplateRepository.findByMealNameContainingIgnoreCase(name);
        meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
        return meals;
    }

    @Transactional
    public List<MealTemplate> searchMealByNameFuzzy(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            List<MealTemplate> meals = mealTemplateRepository.findAll();
            meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
            return meals;
        }

        String normalizedKeyword = normalizeText(keyword);
        if (normalizedKeyword.isEmpty()) {
            List<MealTemplate> meals = mealTemplateRepository.findAll();
            meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));
            return meals;
        }

        int threshold = Math.max(1, normalizedKeyword.length() / 3);

        List<MealTemplate> meals = mealTemplateRepository.findAll();
        meals.forEach(meal -> syncMealNutritionFromDetails(meal, true));

        return meals.stream()
                .map(meal -> new MealSearchScore(meal, scoreMealName(normalizeText(meal.getMealName()), normalizedKeyword, threshold)))
                .filter(item -> item.score() >= 0)
                .sorted(Comparator.comparingInt(MealSearchScore::score))
                .map(MealSearchScore::meal)
                .collect(Collectors.toList());
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

                float quantityInGrams = normalizeQuantityToGrams(detailRequest.getQuantity());

                MealDetail detail = new MealDetail();
                MealDetailId detailId = new MealDetailId(
                        meal.getIdmf(),
                        food.getFoodId(),
                        detailRequest.getMealTime().toLowerCase(Locale.ROOT)
                );
                detail.setId(detailId);
                detail.setMealTemplate(meal);
                detail.setFood(food);
                detail.setQuantity(quantityInGrams);
                try {
                    detail.setMealTime(MealDetail.MealTime.valueOf(detailRequest.getMealTime()));
                } catch (IllegalArgumentException exception) {
                    throw new BadRequestException("mealTime không hợp lệ");
                }

                mealDetails.add(detail);

                float ratio = quantityInGrams / 100f;
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

    @Transactional
    public int recalculateAllMealNutrition() {
        List<MealTemplate> meals = mealTemplateRepository.findAll();
        int updatedCount = 0;

        for (MealTemplate meal : meals) {
            if (syncMealNutritionFromDetails(meal, true)) {
                updatedCount += 1;
            }
        }

        return updatedCount;
    }

    @Transactional
    public MealTemplate updateMealImage(Integer mealId, MultipartFile file) {
        MealTemplate meal = getMealTemplateById(mealId);
        meal.setMealImage(storeMealImageFile(file));
        return mealTemplateRepository.save(meal);
    }

    private String storeMealImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ảnh");
        }

        String extension = resolveImageExtension(file);

        long maxSize = 5L * 1024 * 1024;
        if (file.getSize() > maxSize) {
            throw new BadRequestException("Kích thước ảnh tối đa 5MB");
        }

        try {
            Path uploadDir = Paths.get("uploads", "meals").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String fileName = "meal_" + UUID.randomUUID().toString().replace("-", "") + extension;
            Path target = uploadDir.resolve(fileName);

            file.transferTo(target.toFile());

            return "/uploads/meals/" + fileName;
        } catch (Exception ex) {
            throw new BadRequestException("Không thể lưu ảnh, vui lòng thử lại");
        }
    }

    private String resolveImageExtension(MultipartFile file) {
        String contentType = String.valueOf(file.getContentType()).toLowerCase(Locale.ROOT);
        if ("image/jpeg".equals(contentType) || "image/jpg".equals(contentType) || "image/pjpeg".equals(contentType)) {
            return ".jpg";
        }
        if ("image/png".equals(contentType) || "image/x-png".equals(contentType)) {
            return ".png";
        }

        String fileName = String.valueOf(file.getOriginalFilename()).toLowerCase(Locale.ROOT);
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
            return ".jpg";
        }
        if (fileName.endsWith(".png")) {
            return ".png";
        }

        throw new BadRequestException("Chỉ chấp nhận ảnh JPG hoặc PNG");
    }

    private boolean syncMealNutritionFromDetails(MealTemplate meal, boolean normalizeQuantity) {
        List<MealDetail> details = mealDetailRepository.findByMealTemplateIdmf(meal.getIdmf());

        float totalCalo = 0f;
        float totalProtein = 0f;
        float totalFat = 0f;
        float totalFiber = 0f;
        float totalCarb = 0f;
        boolean detailsChanged = false;

        for (MealDetail detail : details) {
            if (detail == null || detail.getFood() == null) {
                continue;
            }

            float quantityInGrams = normalizeQuantityToGrams(detail.getQuantity());
            if (normalizeQuantity && hasDiff(detail.getQuantity(), quantityInGrams)) {
                detail.setQuantity(quantityInGrams);
                detailsChanged = true;
            }

            float ratio = quantityInGrams / 100f;
            Foods food = detail.getFood();
            totalCalo += valueOrZero(food.getCalories()) * ratio;
            totalProtein += valueOrZero(food.getProtein()) * ratio;
            totalFat += valueOrZero(food.getFat()) * ratio;
            totalFiber += valueOrZero(food.getFiber()) * ratio;
            totalCarb += valueOrZero(food.getCarb()) * ratio;
        }

        if (detailsChanged) {
            mealDetailRepository.saveAll(details);
        }

        boolean mealChanged = hasDiff(meal.getCalo(), totalCalo)
                || hasDiff(meal.getProtein(), totalProtein)
                || hasDiff(meal.getFat(), totalFat)
                || hasDiff(meal.getFiber(), totalFiber)
                || hasDiff(meal.getCarb(), totalCarb);

        if (mealChanged) {
            meal.setCalo(totalCalo);
            meal.setProtein(totalProtein);
            meal.setFat(totalFat);
            meal.setFiber(totalFiber);
            meal.setCarb(totalCarb);
            mealTemplateRepository.save(meal);
        }

        return detailsChanged || mealChanged;
    }

    private float normalizeQuantityToGrams(Float quantity) {
        float normalized = valueOrZero(quantity);
        if (normalized > 0f && normalized <= 20f) {
            return normalized * 100f;
        }
        return normalized;
    }

    private float valueOrZero(Float value) {
        return value == null ? 0f : value;
    }

    private boolean hasDiff(Float left, float right) {
        return Math.abs(valueOrZero(left) - right) > 0.01f;
    }

    private String normalizeText(String value) {
        if (value == null) {
            return "";
        }

        String normalized = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replace('đ', 'd')
                .replace('Đ', 'D')
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9\\s]", " ")
                .trim()
                .replaceAll("\\s+", " ");

        return normalized;
    }

    private int scoreMealName(String normalizedMealName, String normalizedKeyword, int threshold) {
        if (normalizedMealName == null || normalizedMealName.isEmpty()) {
            return -1;
        }

        if (normalizedMealName.contains(normalizedKeyword)) {
            return 0;
        }

        String[] words = normalizedMealName.split(" ");
        int bestDistance = Integer.MAX_VALUE;
        for (String word : words) {
            if (word.isEmpty()) {
                continue;
            }
            int distance = levenshteinDistance(word, normalizedKeyword);
            if (distance < bestDistance) {
                bestDistance = distance;
            }
        }

        if (bestDistance <= threshold) {
            return bestDistance + 10;
        }

        int fullDistance = levenshteinDistance(normalizedMealName, normalizedKeyword);
        if (fullDistance <= Math.max(2, threshold + 2)) {
            return fullDistance + 20;
        }

        return -1;
    }

    private int levenshteinDistance(String left, String right) {
        int leftLength = left.length();
        int rightLength = right.length();

        int[][] dp = new int[leftLength + 1][rightLength + 1];

        for (int i = 0; i <= leftLength; i++) {
            dp[i][0] = i;
        }
        for (int j = 0; j <= rightLength; j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= leftLength; i++) {
            for (int j = 1; j <= rightLength; j++) {
                int cost = left.charAt(i - 1) == right.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                        Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        return dp[leftLength][rightLength];
    }

    private record MealSearchScore(MealTemplate meal, int score) {
    }
}

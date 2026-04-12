package com.ronaldo.meal_planner_vip.service;

import com.ronaldo.meal_planner_vip.dto.FoodAdditionRequestResponse;
import com.ronaldo.meal_planner_vip.dto.FoodRequest;
import com.ronaldo.meal_planner_vip.entity.FoodAdditionRequest;
import com.ronaldo.meal_planner_vip.entity.FoodAdditionRequestStatus;
import com.ronaldo.meal_planner_vip.entity.Foods;
import com.ronaldo.meal_planner_vip.entity.Users;
import com.ronaldo.meal_planner_vip.exception.BadRequestException;
import com.ronaldo.meal_planner_vip.exception.ResourceNotFoundException;
import com.ronaldo.meal_planner_vip.repository.FoodAdditionRequestRepository;
import com.ronaldo.meal_planner_vip.repository.FoodRepository;
import com.ronaldo.meal_planner_vip.repository.UsersRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FoodAdditionRequestService {
    @Autowired
    private FoodAdditionRequestRepository foodAdditionRequestRepository;

    @Autowired
    private FoodRepository foodRepository;

    @Autowired
    private UsersRepository usersRepository;

    @Transactional
    public FoodAdditionRequestResponse submitRequest(FoodRequest request, Integer requestedByUserId) {
        usersRepository.findById(requestedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + requestedByUserId));

        FoodAdditionRequest foodRequest = new FoodAdditionRequest();
        foodRequest.setFoodName(request.getFoodName());
        foodRequest.setCalories(request.getCalories());
        foodRequest.setProtein(request.getProtein());
        foodRequest.setFat(request.getFat());
        foodRequest.setFiber(request.getFiber());
        foodRequest.setCarb(request.getCarb());
        foodRequest.setRequestedByUserId(requestedByUserId);
        foodRequest.setStatus(FoodAdditionRequestStatus.PENDING);
        foodRequest.setRequestedAt(LocalDateTime.now());

        FoodAdditionRequest saved = foodAdditionRequestRepository.save(foodRequest);
        return mapToResponse(saved, preloadUsers(List.of(saved)));
    }

    public List<FoodAdditionRequestResponse> getRequestsByUser(Integer userId) {
        List<FoodAdditionRequest> requests = foodAdditionRequestRepository.findByRequestedByUserIdOrderByRequestedAtDesc(userId);
        Map<Integer, Users> usersMap = preloadUsers(requests);

        return requests.stream()
                .map(request -> mapToResponse(request, usersMap))
                .collect(Collectors.toList());
    }

    public List<FoodAdditionRequestResponse> getRequestsForAdmin(String status) {
        List<FoodAdditionRequest> requests;

        if (status == null || status.isBlank()) {
            requests = foodAdditionRequestRepository.findAllByOrderByRequestedAtDesc();
        } else {
            FoodAdditionRequestStatus parsedStatus = parseStatus(status);
            requests = foodAdditionRequestRepository.findByStatusOrderByRequestedAtDesc(parsedStatus);
        }

        Map<Integer, Users> usersMap = preloadUsers(requests);

        return requests.stream()
                .map(request -> mapToResponse(request, usersMap))
                .collect(Collectors.toList());
    }

    @Transactional
    public FoodAdditionRequestResponse approveRequest(Integer requestId, Integer reviewedByUserId) {
        usersRepository.findById(reviewedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + reviewedByUserId));

        FoodAdditionRequest request = getRequestById(requestId);
        if (request.getStatus() != FoodAdditionRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý trước đó");
        }

        Foods food = new Foods();
        food.setFoodName(request.getFoodName());
        food.setCalories(request.getCalories());
        food.setProtein(request.getProtein());
        food.setFat(request.getFat());
        food.setFiber(request.getFiber());
        food.setCarb(request.getCarb());
        Foods savedFood = foodRepository.save(food);

        request.setStatus(FoodAdditionRequestStatus.APPROVED);
        request.setReviewedByUserId(reviewedByUserId);
        request.setApprovedFoodId(savedFood.getFoodId());
        request.setReviewedAt(LocalDateTime.now());

        FoodAdditionRequest savedRequest = foodAdditionRequestRepository.save(request);
        return mapToResponse(savedRequest, preloadUsers(List.of(savedRequest)));
    }

    @Transactional
    public FoodAdditionRequestResponse rejectRequest(Integer requestId, Integer reviewedByUserId) {
        usersRepository.findById(reviewedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + reviewedByUserId));

        FoodAdditionRequest request = getRequestById(requestId);
        if (request.getStatus() != FoodAdditionRequestStatus.PENDING) {
            throw new BadRequestException("Yêu cầu này đã được xử lý trước đó");
        }

        request.setStatus(FoodAdditionRequestStatus.REJECTED);
        request.setReviewedByUserId(reviewedByUserId);
        request.setReviewedAt(LocalDateTime.now());

        FoodAdditionRequest savedRequest = foodAdditionRequestRepository.save(request);
        return mapToResponse(savedRequest, preloadUsers(List.of(savedRequest)));
    }

    private FoodAdditionRequest getRequestById(Integer requestId) {
        return foodAdditionRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy yêu cầu với ID: " + requestId));
    }

    private FoodAdditionRequestStatus parseStatus(String status) {
        try {
            return FoodAdditionRequestStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new BadRequestException("status không hợp lệ. Hỗ trợ: PENDING, APPROVED, REJECTED");
        }
    }

    private Map<Integer, Users> preloadUsers(List<FoodAdditionRequest> requests) {
        Set<Integer> userIds = new HashSet<>();

        for (FoodAdditionRequest request : requests) {
            if (request == null) {
                continue;
            }
            if (request.getRequestedByUserId() != null) {
                userIds.add(request.getRequestedByUserId());
            }
            if (request.getReviewedByUserId() != null) {
                userIds.add(request.getReviewedByUserId());
            }
        }

        if (userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        return usersRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(Users::getUserId, user -> user));
    }

    private FoodAdditionRequestResponse mapToResponse(FoodAdditionRequest request, Map<Integer, Users> usersMap) {
        FoodAdditionRequestResponse response = new FoodAdditionRequestResponse();
        response.setRequestId(request.getRequestId());
        response.setFoodName(request.getFoodName());
        response.setCalories(request.getCalories());
        response.setProtein(request.getProtein());
        response.setFat(request.getFat());
        response.setFiber(request.getFiber());
        response.setCarb(request.getCarb());
        response.setStatus(request.getStatus() == null ? null : request.getStatus().name());
        response.setRequestedByUserId(request.getRequestedByUserId());
        response.setReviewedByUserId(request.getReviewedByUserId());
        response.setApprovedFoodId(request.getApprovedFoodId());
        response.setRequestedAt(request.getRequestedAt());
        response.setReviewedAt(request.getReviewedAt());

        Users requestedBy = usersMap.get(request.getRequestedByUserId());
        if (requestedBy != null) {
            response.setRequestedByUsername(requestedBy.getUsername());
            response.setRequestedByEmail(requestedBy.getEmail());
        }

        return response;
    }
}

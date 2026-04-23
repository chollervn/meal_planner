package com.ronaldo.meal_planner_vip.dto;

import java.util.ArrayList;
import java.util.List;

public class FoodUsageStatsPageResponse {
    private List<FoodUsageStatResponse> items = new ArrayList<>();
    private Integer page;
    private Integer pageSize;
    private Long totalItems;
    private Integer totalPages;

    public FoodUsageStatsPageResponse() {
    }

    public FoodUsageStatsPageResponse(List<FoodUsageStatResponse> items, Integer page, Integer pageSize, Long totalItems, Integer totalPages) {
        this.items = items;
        this.page = page;
        this.pageSize = pageSize;
        this.totalItems = totalItems;
        this.totalPages = totalPages;
    }

    public List<FoodUsageStatResponse> getItems() {
        return items;
    }

    public void setItems(List<FoodUsageStatResponse> items) {
        this.items = items;
    }

    public Integer getPage() {
        return page;
    }

    public void setPage(Integer page) {
        this.page = page;
    }

    public Integer getPageSize() {
        return pageSize;
    }

    public void setPageSize(Integer pageSize) {
        this.pageSize = pageSize;
    }

    public Long getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Long totalItems) {
        this.totalItems = totalItems;
    }

    public Integer getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(Integer totalPages) {
        this.totalPages = totalPages;
    }
}

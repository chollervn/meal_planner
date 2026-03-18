package com.ronaldo.meal_planner_vip.repository;

import com.ronaldo.meal_planner_vip.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {
    Users findByEmail(String email);
    Users findByUsername(String username);
    boolean existsByEmail(String email);
}

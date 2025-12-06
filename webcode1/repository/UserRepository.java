package com.example.webcode1.repository;

import com.example.webcode1.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 用户数据访问接口
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 根据用户名查询用户信息
     * Spring Data JPA 会自动实现这个方法
     */
    User findByUsername(String username);
}
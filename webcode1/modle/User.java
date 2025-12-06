package com.example.webcode1.model;

import jakarta.persistence.*;

// Lombok 注解，请确保 pom.xml 中有 lombok 依赖
import lombok.Data; 

/**
 * 对应数据库中的 userinfo 表
 */
@Entity
@Table(name = "userinfo")
@Data // Lombok: 自动生成 Getter, Setter, toString, equals, hashCode
public class User {

    @Id // 主键
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 自增策略
    private Long id;

    // 对应 userinfo 表中的 username 字段
    @Column(nullable = false, unique = true)
    private String username;

    // 对应 userinfo 表中的 password 字段
    @Column(nullable = false)
    private String password;

    // 构造函数、Getter/Setter 由 @Data 自动生成
}
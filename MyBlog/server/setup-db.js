import 'dotenv/config';
import mysql from 'mysql2/promise';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true // Allow multiple SQL statements
};

const DDL_SCRIPT = "`
CREATE DATABASE IF NOT EXISTS 
${process.env.DB_NAME}
` DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE 
${process.env.DB_NAME}
`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS articles;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS favorites;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS carousels;
DROP TABLE IF EXISTS game_scores;
DROP TABLE IF EXISTS site_visits;
DROP TABLE IF EXISTS comment_reports;
DROP TABLE IF EXISTS dev_logs;
DROP TABLE IF EXISTS userinfo;

CREATE TABLE 
`userinfo`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'user',
  `status` int DEFAULT '1',
  `credit_score` int DEFAULT '100',
  `avatar` varchar(500) DEFAULT NULL,
  `bio` varchar(500) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `login_fail_count` int DEFAULT '0',
  `frozen_until` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
);

CREATE TABLE 
`articles`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `content` longtext NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `summary` varchar(500) DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT '1',
  `user_id` int NOT NULL,
  `status` varchar(50) DEFAULT 'published',
  `views` int DEFAULT '0',
  `likes_count` int DEFAULT '0',
  `fav_count` int DEFAULT '0',
  `comments_count` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES 
`userinfo`
 (`id`) ON DELETE CASCADE
);

CREATE TABLE 
`comments`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `article_id` int NOT NULL,
  `user_id` int NOT NULL,
  `parent_id` int DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES 
`articles`
 (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES 
`userinfo`
 (`id`) ON DELETE CASCADE
);

CREATE TABLE 
`media`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `type` varchar(50) DEFAULT 'image',
  `size` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES 
`userinfo`
 (`id`) ON DELETE CASCADE
);

CREATE TABLE 
`likes`
 (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  PRIMARY KEY (`user_id`,
`article_id`)
);

CREATE TABLE 
`favorites`
 (
  `user_id` int NOT NULL,
  `article_id` int NOT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,
`article_id`)
);

CREATE TABLE 
`follows`
 (
  `follower_id` int NOT NULL,
  `followed_id` int NOT NULL,
  PRIMARY KEY (`follower_id`,
`followed_id`)
);

CREATE TABLE 
`carousels`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `url` varchar(500) NOT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE 
`game_scores`
 (
  `user_id` int NOT NULL,
  `score` int DEFAULT '0',
  PRIMARY KEY (`user_id`)
);

CREATE TABLE 
`site_visits`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `ip_address` varchar(100) DEFAULT NULL,
  `visit_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE 
`comment_reports`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `comment_id` int NOT NULL,
  `reporter_id` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` int DEFAULT '0',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE 
`dev_logs`
 (
  `id` int NOT NULL AUTO_INCREMENT,
  `version` varchar(50) DEFAULT NULL,
  `content` text,
  `type` varchar(50) DEFAULT NULL,
  `author` varchar(100) DEFAULT NULL,
  `commit_hash` varchar(100) DEFAULT NULL,
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

SET FOREIGN_KEY_CHECKS = 1;
"
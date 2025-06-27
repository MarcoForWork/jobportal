DROP DATABASE IF EXISTS `jobportal`;

CREATE DATABASE `jobportal`;

DROP USER IF EXISTS 'jobportal'@'%';
CREATE USER 'jobportal'@'%' IDENTIFIED BY 'jobportal';
GRANT ALL PRIVILEGES ON `jobportal`.* TO 'jobportal'@'%'; -- Grant privileges specifically to the 'jobportal' database
FLUSH PRIVILEGES;

USE `jobportal`;

CREATE TABLE `users` (
    `id` VARCHAR(255) PRIMARY KEY,
    `username` VARCHAR(255) UNIQUE NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255),
    `last_name` VARCHAR(255),  
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `dob` DATE NOT NULL,
    `phone` VARCHAR(255),  
    role ENUM('candidate', 'recruiter', 'admin') NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (owner_user_id) REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE job_postings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL, -- Khóa ngoại liên kết với bảng companies
    job_title VARCHAR(255) NOT NULL,
    salary_negotiable BOOLEAN DEFAULT TRUE,
    location VARCHAR(255),
    status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    skills JSON, -- Để lưu trữ mảng các kỹ năng như SQL, ERP, Data Analytics
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Tự động cập nhật khi có thay đổi
    is_active BOOLEAN DEFAULT TRUE, -- Trạng thái bài đăng (còn hiệu lực hay không)

    -- Định nghĩa khóa ngoại
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
        ON DELETE CASCADE -- Nếu một công ty bị xóa, tất cả bài đăng của công ty đó cũng bị xóa
        ON UPDATE CASCADE  -- Nếu company_id trong bảng companies thay đổi, company_id trong job_postings cũng thay đổi
);

CREATE TABLE `job_posting_details` (
    `job_posting_id` INT NOT NULL,
    `salary_description` VARCHAR(255) NULL,
    `job_level` VARCHAR(255) NULL,
    `work_format` VARCHAR(255) NULL,
    `contract_type` VARCHAR(255) NULL,
    `responsibilities` TEXT NULL,
    `required_skills` TEXT NULL,
    `benefits` TEXT NULL,
    PRIMARY KEY (`job_posting_id`),

    -- Sửa lỗi ở dòng dưới đây
    CONSTRAINT `fk_details_to_job_postings`
    FOREIGN KEY (`job_posting_id`)
    REFERENCES `job_postings`(`job_id`) -- Phải là `job_postings` (số nhiều)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `job_applications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `apply_date` DATETIME DEFAULT NULL,
    state ENUM('Pending', 'Accepted', 'Rejected') NOT NULL,
    `job_id` INT DEFAULT NULL, -- Khóa ngoại liên kết đến Job posting
    `user_id` VARCHAR(255), -- Khóa ngoại liên kết đến user

    UNIQUE KEY (user_id, job_id),

    FOREIGN KEY (job_id) REFERENCES job_postings(job_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE `files` (
    `id` VARCHAR(255) PRIMARY KEY,
    `file_name` VARCHAR(255),
    `file_path` VARCHAR(255),
    `user_id` VARCHAR(255),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    link VARCHAR(255) NULL,
    PRIMARY KEY (id),
    INDEX fk_notifications_user_idx (user_id ASC),
    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- CREATE TABLE candidates (
--     id VARCHAR(255) PRIMARY KEY,
--     name VARCHAR(255) NOT NULL,
--     dob DATE,
--     address VARCHAR(255),
--     cv_file_path VARCHAR(255),

--     FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
-- );

-- CREATE TABLE candidates_skills (
-- 	id VARCHAR(255),
-- 	candidate_id VARCHAR(255),
-- 	experience_level VARCHAR(255),
-- 	years_of_experience INT,
-- 	note VARCHAR(255),
-- 	FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
-- )

-- CREATE TABLE recruiters (
--     id VARCHAR(255) PRIMARY KEY,
--     company_name VARCHAR(255),
--     FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
-- );




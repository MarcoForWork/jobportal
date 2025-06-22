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
    `dob` DATE UNIQUE NOT NULL,
    `phone` VARCHAR(255),  
    role ENUM('candidate', 'recruiter') NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE users MODIFY COLUMN dob VARCHAR(255);

CREATE TABLE companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    owner_user_id VARCHAR(255) UNIQUE NOT NULL, -- Khóa ngoại trỏ đến id của bảng users, UNIQUE để 1 recruiter chỉ quản lý 1 công ty
    company_name VARCHAR(255) NOT NULL UNIQUE,
    industry VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Định nghĩa khóa ngoại
    FOREIGN KEY (owner_user_id) REFERENCES users(id)
        ON DELETE RESTRICT -- Đã xóa comment nằm giữa dòng
        ON UPDATE CASCADE
);

CREATE TABLE job_postings (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL, -- Khóa ngoại liên kết với bảng companies
    job_title VARCHAR(255) NOT NULL,
    salary_negotiable BOOLEAN DEFAULT TRUE,
    location VARCHAR(255),
    skills JSON, -- Để lưu trữ mảng các kỹ năng như SQL, ERP, Data Analytics
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Tự động cập nhật khi có thay đổi
    is_active BOOLEAN DEFAULT TRUE, -- Trạng thái bài đăng (còn hiệu lực hay không)

    -- Định nghĩa khóa ngoại
    FOREIGN KEY (company_id) REFERENCES companies(company_id)
        ON DELETE CASCADE -- Nếu một công ty bị xóa, tất cả bài đăng của công ty đó cũng bị xóa
        ON UPDATE CASCADE  -- Nếu company_id trong bảng companies thay đổi, company_id trong job_postings cũng thay đổi
);

ALTER TABLE job_postings DROP FOREIGN KEY job_postings_ibfk_1;

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




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
    `email` VARCHAR(255) UNIQUE NOT NULL,
    `phone` VARCHAR(255),  
    role ENUM('candidate', 'recruiter') NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
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

-- CREATE TABLE job_posts (
--     id VARCHAR(255) AUTO_INCREMENT PRIMARY KEY,
--     recruiter_id VARCHAR(255) NOT NULL,
--     title VARCHAR(255) NOT NULL,
--     description VARCHAR(255),
--     location VARCHAR(255),
--     salary VARCHAR(100),
--     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     deadline DATE,
--     FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE
-- );

-- CREATE TABLE applications (
--     id VARCHAR(255) AUTO_INCREMENT PRIMARY KEY,
--     candidate_id VARCHAR(255) NOT NULL,
--     job_post_id VARCHAR(255) NOT NULL,
--     applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
--     status ENUM('applied', 'reviewed', 'accepted', 'rejected') DEFAULT 'applied',
--     FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
--     FOREIGN KEY (job_post_id) REFERENCES job_posts(id) ON DELETE CASCADE,
--     UNIQUE(candidate_id, job_post_id) 
-- );


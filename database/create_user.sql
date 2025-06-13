-- -- Drop user first if they exist
-- DROP USER IF EXISTS 'jobportal'@'%';

-- -- Now create user with prop privileges
-- CREATE USER 'jobportal'@'localhost' IDENTIFIED BY 'jobportal';

-- GRANT ALL PRIVILEGES ON * . * TO 'jobportal'@'localhost';

CREATE USER 'jobportal'@'%' IDENTIFIED BY 'jobportal'; -- '%' allows connections from any host, including Docker's internal network IPs
GRANT ALL PRIVILEGES ON job_portal.* TO 'jobportal'@'%';
FLUSH PRIVILEGES;
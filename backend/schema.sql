-- Smart Campus Database Schema
-- Run this script to create all tables in your existing database

-- Use your existing database (provided by hosting service)
USE sql12822235;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(191) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(500),
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    oauth_provider VARCHAR(50),
    oauth_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    capacity INT,
    location VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    availability_start TIME,
    availability_end TIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    created_by BIGINT,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_location (location),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    purpose TEXT,
    expected_attendees INT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    admin_comment TEXT,
    reviewed_by BIGINT,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_resource (resource_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_date (booking_date),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tickets table
CREATE TABLE IF NOT EXISTS tickets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    resource_id BIGINT,
    user_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assigned_to BIGINT,
    resolution_notes TEXT,
    contact_details VARCHAR(255),
    resolved_at DATETIME NULL,
    closed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_assigned (assigned_to),
    INDEX idx_resource (resource_id),
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Ticket attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ticket (ticket_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    INDEX idx_ticket (ticket_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample data for testing
INSERT INTO users (email, name, role, oauth_provider) VALUES
('admin@smartcampus.edu', 'Admin User', 'ADMIN', 'google'),
('john.doe@smartcampus.edu', 'John Doe', 'USER', 'google'),
('tech@smartcampus.edu', 'Tech Support', 'TECHNICIAN', 'google');

INSERT INTO resources (name, description, type, capacity, location, status, availability_start, availability_end, created_by, created_at) VALUES
('Lecture Hall A', 'Main lecture hall with projector', 'LECTURE_HALL', 100, 'Building A, Floor 1', 'ACTIVE', '08:00:00', '18:00:00', 1, CURRENT_TIMESTAMP),
('Computer Lab 1', 'Lab with 30 workstations', 'LAB', 30, 'Building B, Floor 2', 'ACTIVE', '08:00:00', '20:00:00', 1, CURRENT_TIMESTAMP),
('Meeting Room 101', 'Small meeting room', 'MEETING_ROOM', 10, 'Building A, Floor 2', 'ACTIVE', '08:00:00', '17:00:00', 1, CURRENT_TIMESTAMP),
('Projector Pro X1', 'High-end projector', 'PROJECTOR', NULL, 'Equipment Room', 'ACTIVE', '08:00:00', '17:00:00', 1, CURRENT_TIMESTAMP);

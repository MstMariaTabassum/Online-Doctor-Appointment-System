-- Create database
CREATE DATABASE IF NOT EXISTS doctor_appointment;
USE doctor_appointment;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('patient', 'doctor', 'admin') DEFAULT 'patient',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Doctors table
CREATE TABLE doctors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    specialization VARCHAR(100) NOT NULL,
    experience INT DEFAULT 0,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Appointments table
CREATE TABLE appointments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    symptoms TEXT NOT NULL,
    consultation_fee DECIMAL(10,2) DEFAULT 0,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (doctor_id) REFERENCES users(id)
);

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password, phone, role) VALUES 
('Admin', 'admin@example.com', '$2y$10$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '0123456789', 'admin');

-- Insert sample doctors
INSERT INTO users (name, email, password, phone, role) VALUES 
('Dr. John Smith', 'john@example.com', '$2y$10$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '0123456781', 'doctor'),
('Dr. Sarah Johnson', 'sarah@example.com', '$2y$10$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '0123456782', 'doctor'),
('Dr. Michael Brown', 'michael@example.com', '$2y$10$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '0123456783', 'doctor');

INSERT INTO doctors (user_id, specialization, experience, consultation_fee) VALUES 
(2, 'Cardiologist', 10, 100),
(3, 'Dermatologist', 8, 80),
(4, 'Pediatrician', 12, 90);

-- Insert sample patient
INSERT INTO users (name, email, password, phone, role) VALUES 
('Patient One', 'patient@example.com', '$2y$10$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '0123456784', 'patient');
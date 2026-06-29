<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Debug logging
    error_log("Book appointment request received: " . json_encode($data));
    
    $patient_id = $data['patient_id'] ?? '';
    $doctor_id = $data['doctor_id'] ?? '';
    $appointment_date = $data['appointment_date'] ?? '';
    $appointment_time = $data['appointment_time'] ?? '';
    $symptoms = $data['symptoms'] ?? '';
    
    // Validation
    if (empty($patient_id) || empty($doctor_id) || empty($appointment_date) || empty($appointment_time) || empty($symptoms)) {
        error_log("Validation failed: Missing fields");
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    // Check if patient exists
    $stmt = $pdo->prepare("SELECT id, name FROM users WHERE id = ? AND role = 'patient'");
    $stmt->execute([$patient_id]);
    $patient = $stmt->fetch();
    
    if (!$patient) {
        error_log("Patient not found: " . $patient_id);
        echo json_encode(['success' => false, 'message' => 'Patient not found']);
        exit;
    }
    
    // Check if doctor exists
    $stmt = $pdo->prepare("SELECT u.id, u.name, d.consultation_fee FROM users u JOIN doctors d ON u.id = d.user_id WHERE u.id = ? AND u.role = 'doctor'");
    $stmt->execute([$doctor_id]);
    $doctor = $stmt->fetch();
    
    if (!$doctor) {
        error_log("Doctor not found: " . $doctor_id);
        echo json_encode(['success' => false, 'message' => 'Doctor not found']);
        exit;
    }
    
    // Get consultation fee
    $consultation_fee = $doctor['consultation_fee'] ?? 0;
    
    error_log("Patient: " . $patient['name'] . ", Doctor: Dr. " . $doctor['name'] . ", Fee: $" . $consultation_fee);
    
    try {
        // Insert appointment
        $stmt = $pdo->prepare("
            INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, symptoms, consultation_fee, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ");
        
        $success = $stmt->execute([
            $patient_id, 
            $doctor_id, 
            $appointment_date, 
            $appointment_time, 
            $symptoms, 
            $consultation_fee
        ]);
        
        if ($success) {
            $appointment_id = $pdo->lastInsertId();
            error_log("Appointment booked successfully. ID: " . $appointment_id);
            echo json_encode([
                'success' => true, 
                'message' => 'Appointment booked successfully with Dr. ' . $doctor['name'] . ' on ' . $appointment_date . ' at ' . $appointment_time
            ]);
        } else {
            error_log("Failed to execute appointment insert query");
            echo json_encode(['success' => false, 'message' => 'Failed to book appointment']);
        }
        
    } catch (Exception $e) {
        error_log("Exception in book_appointment.php: " . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to book appointment: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
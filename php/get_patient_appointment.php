<?php
require_once 'config.php';

$patient_id = $_GET['patient_id'] ?? '';

if (empty($patient_id)) {
    echo json_encode(['error' => 'Patient ID required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT a.*, u.name as doctor_name, d.specialization, d.consultation_fee 
        FROM appointments a 
        JOIN users u ON a.doctor_id = u.id 
        LEFT JOIN doctors d ON u.id = d.user_id 
        WHERE a.patient_id = ? 
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
    ");
    $stmt->execute([$patient_id]);
    $appointments = $stmt->fetchAll();
    
    echo json_encode($appointments);
} catch (Exception $e) {
    error_log("Error in get_patient_appointments.php: " . $e->getMessage());
    echo json_encode(['error' => $e->getMessage()]);
}
?>
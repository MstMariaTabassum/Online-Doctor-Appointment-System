<?php
require_once 'config.php';

$patient_id = $_GET['patient_id'] ?? '';

if (empty($patient_id)) {
    echo json_encode(['error' => 'Patient ID required']);
    exit;
}

try {
    // Total appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM appointments WHERE patient_id = ?");
    $stmt->execute([$patient_id]);
    $total = $stmt->fetch()['total'];
    
    // Upcoming appointments (today and future)
    $stmt = $pdo->prepare("SELECT COUNT(*) as upcoming FROM appointments WHERE patient_id = ? AND appointment_date >= CURDATE() AND status IN ('pending', 'confirmed')");
    $stmt->execute([$patient_id]);
    $upcoming = $stmt->fetch()['upcoming'];
    
    // Completed appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as completed FROM appointments WHERE patient_id = ? AND status = 'completed'");
    $stmt->execute([$patient_id]);
    $completed = $stmt->fetch()['completed'];
    
    // Cancelled appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as cancelled FROM appointments WHERE patient_id = ? AND status = 'cancelled'");
    $stmt->execute([$patient_id]);
    $cancelled = $stmt->fetch()['cancelled'];
    
    echo json_encode([
        'total_appointments' => $total,
        'upcoming_appointments' => $upcoming,
        'completed_appointments' => $completed,
        'cancelled_appointments' => $cancelled
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
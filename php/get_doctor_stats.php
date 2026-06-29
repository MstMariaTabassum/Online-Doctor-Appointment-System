<?php
require_once 'config.php';

$doctor_id = $_GET['doctor_id'] ?? '';

if (empty($doctor_id)) {
    echo json_encode(['error' => 'Doctor ID required']);
    exit;
}

try {
    // Total appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM appointments WHERE doctor_id = ?");
    $stmt->execute([$doctor_id]);
    $total = $stmt->fetch()['total'];
    
    // Today's appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as today FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE()");
    $stmt->execute([$doctor_id]);
    $today = $stmt->fetch()['today'];
    
    // Pending appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as pending FROM appointments WHERE doctor_id = ? AND status = 'pending'");
    $stmt->execute([$doctor_id]);
    $pending = $stmt->fetch()['pending'];
    
    // Confirmed appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as confirmed FROM appointments WHERE doctor_id = ? AND status = 'confirmed'");
    $stmt->execute([$doctor_id]);
    $confirmed = $stmt->fetch()['confirmed'];
    
    echo json_encode([
        'total_appointments' => $total,
        'today_appointments' => $today,
        'pending_appointments' => $pending,
        'confirmed_appointments' => $confirmed
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
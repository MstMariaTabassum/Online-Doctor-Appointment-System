<?php
require_once 'config.php';

try {
    // Total users (excluding admin)
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role != 'admin'");
    $total_users = $stmt->fetch()['total'];
    
    // Total doctors
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM users WHERE role = 'doctor'");
    $total_doctors = $stmt->fetch()['total'];
    
    // Total appointments
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM appointments");
    $total_appointments = $stmt->fetch()['total'];
    
    // Today's appointments
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM appointments WHERE appointment_date = CURDATE()");
    $stmt->execute();
    $today_appointments = $stmt->fetch()['total'];
    
    echo json_encode([
        'total_users' => $total_users,
        'total_doctors' => $total_doctors,
        'total_appointments' => $total_appointments,
        'today_appointments' => $today_appointments
    ]);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
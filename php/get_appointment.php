<?php
require_once 'config.php';

// Get role and ID from query parameters
$role = $_GET['role'] ?? '';
$id = $_GET['id'] ?? '';

try {
    if ($role === 'doctor') {
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as patient_name, u.phone as patient_phone 
            FROM appointments a 
            JOIN users u ON a.patient_id = u.id 
            WHERE a.doctor_id = ? 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ");
        $stmt->execute([$id]);
    } elseif ($role === 'patient') {
        $stmt = $pdo->prepare("
            SELECT a.*, u.name as doctor_name 
            FROM appointments a 
            JOIN users u ON a.doctor_id = u.id 
            WHERE a.patient_id = ? 
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        ");
        $stmt->execute([$id]);
    } else {
        echo json_encode(['error' => 'Invalid role']);
        exit;
    }
    
    $appointments = $stmt->fetchAll();
    echo json_encode($appointments);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
<?php
require_once 'config.php';

$appointment_id = $_GET['id'] ?? '';

if (empty($appointment_id)) {
    echo json_encode(['error' => 'Appointment ID required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            a.*,
            p.name as patient_name,
            p.phone as patient_phone,
            d.name as doctor_name,
            DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i:%s') as created_at
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users d ON a.doctor_id = d.id
        WHERE a.id = ?
    ");
    $stmt->execute([$appointment_id]);
    $appointment = $stmt->fetch();
    
    if (!$appointment) {
        echo json_encode(['error' => 'Appointment not found']);
        exit;
    }
    
    echo json_encode($appointment);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
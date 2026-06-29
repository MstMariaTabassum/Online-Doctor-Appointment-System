<?php
require_once 'config.php';

try {
    // Get recent appointments
    $stmt = $pdo->prepare("
        SELECT 
            'appointment' as type,
            CONCAT('New appointment booked by ', p.name, ' with Dr. ', d.name) as description,
            DATE_FORMAT(a.created_at, '%b %d, %Y %h:%i %p') as time
        FROM appointments a
        JOIN users p ON a.patient_id = p.id
        JOIN users d ON a.doctor_id = d.id
        ORDER BY a.created_at DESC
        LIMIT 5
    ");
    $stmt->execute();
    $activities = $stmt->fetchAll();
    
    // If no appointments, show some dummy activities
    if (count($activities) === 0) {
        $activities = [
            [
                'type' => 'system',
                'description' => 'System initialized successfully',
                'time' => date('M d, Y h:i A')
            ],
            [
                'type' => 'user',
                'description' => 'Admin logged into the system',
                'time' => date('M d, Y h:i A', strtotime('-1 hour'))
            ]
        ];
    }
    
    echo json_encode($activities);
} catch (Exception $e) {
    echo json_encode([]);
}
?>
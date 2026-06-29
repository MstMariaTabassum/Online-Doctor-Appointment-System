<?php
require_once 'config.php';

$id = $_GET['id'] ?? '';

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'Appointment ID required']);
    exit;
}

try {
    // Check if appointment exists
    $stmt = $pdo->prepare("SELECT id FROM appointments WHERE id = ?");
    $stmt->execute([$id]);
    
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Appointment not found']);
        exit;
    }
    
    // Delete appointment
    $stmt = $pdo->prepare("DELETE FROM appointments WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'Appointment deleted successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to delete appointment: ' . $e->getMessage()]);
}
?>
<?php
require_once 'config.php';

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, phone, role, created_at 
        FROM users 
        WHERE role != 'admin' 
        ORDER BY created_at DESC
    ");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    echo json_encode($users);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
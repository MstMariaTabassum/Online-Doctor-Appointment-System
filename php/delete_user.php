<?php
require_once 'config.php';

$id = $_GET['id'] ?? '';

if (empty($id)) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    
    // Don't allow deleting admin users
    if ($user['role'] === 'admin') {
        echo json_encode(['success' => false, 'message' => 'Cannot delete admin users']);
        exit;
    }
    
    // Delete user (cascade will handle doctors table)
    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    
    echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Failed to delete user: ' . $e->getMessage()]);
}
?>
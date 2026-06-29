<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $name = $data['name'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $phone = $data['phone'] ?? '';
    $role = $data['role'] ?? 'patient';
    $specialization = $data['specialization'] ?? '';
    $experience = $data['experience'] ?? 0;
    $consultation_fee = $data['consultation_fee'] ?? 0;
    
    // Validation
    if (empty($name) || empty($email) || empty($password) || empty($phone)) {
        echo json_encode(['success' => false, 'message' => 'All fields are required']);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(['success' => false, 'message' => 'Invalid email format']);
        exit;
    }
    
    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->rowCount() > 0) {
        echo json_encode(['success' => false, 'message' => 'Email already exists']);
        exit;
    }
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Start transaction
    $pdo->beginTransaction();
    
    try {
        // Insert into users table
        $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$name, $email, $hashed_password, $phone, $role]);
        $user_id = $pdo->lastInsertId();
        
        // If doctor, insert into doctors table
        if ($role === 'doctor') {
            $stmt = $pdo->prepare("INSERT INTO doctors (user_id, specialization, experience, consultation_fee) VALUES (?, ?, ?, ?)");
            $stmt->execute([$user_id, $specialization, $experience, $consultation_fee]);
        }
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Registration successful. Please login.']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
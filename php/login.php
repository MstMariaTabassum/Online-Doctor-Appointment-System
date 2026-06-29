<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $role = $data['role'] ?? 'patient';
    
    // Validation
    if (empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'message' => 'Email and password are required']);
        exit;
    }
    
    try {
        // Check user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND role = ?");
        $stmt->execute([$email, $role]);
        $user = $stmt->fetch();
        
        // Default admin credentials check
        $default_admin_email = "admin@example.com";
        $default_admin_password = "admin123";
        
        if ($email === $default_admin_email && $password === $default_admin_password && $role === 'admin') {
            // Check if admin exists in database
            if (!$user) {
                // Create admin user if not exists
                $hashed_password = password_hash($default_admin_password, PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute(['Admin', $default_admin_email, $hashed_password, '0123456789', 'admin']);
                $user_id = $pdo->lastInsertId();
                
                $user = [
                    'id' => $user_id,
                    'name' => 'Admin',
                    'email' => $default_admin_email,
                    'role' => 'admin'
                ];
            }
            
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        }
        elseif ($user && password_verify($password, $user['password'])) {
            echo json_encode([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user['id'],
                    'name' => $user['name'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid email, password or role']);
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Login failed: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>
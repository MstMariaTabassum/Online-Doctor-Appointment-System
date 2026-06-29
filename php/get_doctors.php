<?php
// Simple get_doctors.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'localhost';
$dbname = 'doctor_appointment';
$username = 'root';
$password = '';

$response = [];

try {
    // Connect to database
    $conn = new mysqli($host, $username, $password, $dbname);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Set charset
    $conn->set_charset("utf8mb4");
    
    // Query to get doctors
    $sql = "
        SELECT 
            u.id as user_id,
            u.name,
            u.email,
            COALESCE(d.specialization, 'General Physician') as specialization,
            COALESCE(d.experience, 0) as experience,
            COALESCE(d.consultation_fee, 0) as consultation_fee
        FROM users u 
        LEFT JOIN doctors d ON u.id = d.user_id 
        WHERE u.role = 'doctor'
        ORDER BY u.name
    ";
    
    $result = $conn->query($sql);
    
    if ($result->num_rows > 0) {
        $doctors = [];
        while($row = $result->fetch_assoc()) {
            $doctors[] = $row;
        }
        $response = $doctors;
    } else {
        // Return empty array
        $response = [];
    }
    
    $conn->close();
    
} catch (Exception $e) {
    $response = [
        'error' => true,
        'message' => $e->getMessage()
    ];
}

echo json_encode($response, JSON_PRETTY_PRINT);
?>
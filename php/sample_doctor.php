<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Add Sample Doctors</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        pre { background: #f5f5f5; padding: 10px; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>Add Sample Doctors to Database</h1>
    
    <?php
    // Database configuration
    $host = 'localhost';
    $dbname = 'doctor_appointment';
    $username = 'root';
    $password = '';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        echo "<p>✅ Connected to database successfully</p>";
        
        // Check current doctors
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'");
        $doctorCount = $stmt->fetch()['count'];
        
        echo "<p>Current doctors in system: <strong>$doctorCount</strong></p>";
        
        if ($doctorCount == 0) {
            echo "<p class='error'>❌ No doctors found! Adding sample doctors...</p>";
            
            // Start transaction
            $pdo->beginTransaction();
            
            try {
                // Add doctors to users table
                $usersSql = "INSERT INTO users (name, email, password, phone, role) VALUES 
                    ('Dr. John Smith', 'john.smith@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345678', 'doctor'),
                    ('Dr. Sarah Johnson', 'sarah.j@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345679', 'doctor'),
                    ('Dr. Michael Brown', 'michael.b@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345680', 'doctor'),
                    ('Dr. Emily Davis', 'emily.d@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345681', 'doctor'),
                    ('Dr. Robert Wilson', 'robert.w@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345682', 'doctor')";
                
                $pdo->exec($usersSql);
                echo "<p>✅ Added 5 doctors to users table</p>";
                
                // Get the last inserted IDs
                $lastId = $pdo->lastInsertId();
                
                // Add to doctors table
                $doctorsSql = "INSERT INTO doctors (user_id, specialization, experience, consultation_fee) VALUES 
                    ($lastId-4, 'Cardiologist', 10, 100),
                    ($lastId-3, 'Dermatologist', 8, 80),
                    ($lastId-2, 'Pediatrician', 12, 90),
                    ($lastId-1, 'Neurologist', 15, 120),
                    ($lastId, 'Orthopedic', 9, 110)";
                
                $pdo->exec($doctorsSql);
                echo "<p>✅ Added doctor details to doctors table</p>";
                
                $pdo->commit();
                echo "<p class='success'>✅ Successfully added 5 sample doctors!</p>";
                
                // Show the added doctors
                $stmt = $pdo->query("
                    SELECT u.id, u.name, u.email, d.specialization, d.experience, d.consultation_fee
                    FROM users u 
                    JOIN doctors d ON u.id = d.user_id 
                    WHERE u.role = 'doctor'
                    ORDER BY u.id DESC LIMIT 5
                ");
                
                $doctors = $stmt->fetchAll();
                
                echo "<h3>Added Doctors:</h3>";
                echo "<table border='1' cellpadding='10'>";
                echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Specialization</th><th>Experience</th><th>Fee</th></tr>";
                
                foreach ($doctors as $doctor) {
                    echo "<tr>";
                    echo "<td>" . $doctor['id'] . "</td>";
                    echo "<td>" . $doctor['name'] . "</td>";
                    echo "<td>" . $doctor['email'] . "</td>";
                    echo "<td>" . $doctor['specialization'] . "</td>";
                    echo "<td>" . $doctor['experience'] . " years</td>";
                    echo "<td>$" . $doctor['consultation_fee'] . "</td>";
                    echo "</tr>";
                }
                echo "</table>";
                
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
            
        } else {
            echo "<p class='success'>✅ Doctors already exist in database</p>";
            
            // Show existing doctors
            $stmt = $pdo->query("
                SELECT u.id, u.name, u.email, d.specialization, d.experience, d.consultation_fee
                FROM users u 
                JOIN doctors d ON u.id = d.user_id 
                WHERE u.role = 'doctor'
                ORDER BY u.name
            ");
            
            $doctors = $stmt->fetchAll();
            
            echo "<h3>Existing Doctors:</h3>";
            echo "<p>Found " . count($doctors) . " doctors</p>";
            
            if (count($doctors) > 0) {
                echo "<table border='1' cellpadding='10'>";
                echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Specialization</th><th>Experience</th><th>Fee</th></tr>";
                
                foreach ($doctors as $doctor) {
                    echo "<tr>";
                    echo "<td>" . $doctor['id'] . "</td>";
                    echo "<td>" . $doctor['name'] . "</td>";
                    echo "<td>" . $doctor['email'] . "</td>";
                    echo "<td>" . $doctor['specialization'] . "</td>";
                    echo "<td>" . $doctor['experience'] . " years</td>";
                    echo "<td>$" . $doctor['consultation_fee'] . "</td>";
                    echo "</tr>";
                }
                echo "</table>";
            }
        }
        
        echo "<hr>";
        echo "<h3>Test Links:</h3>";
        echo "<ul>";
        echo "<li><a href='get_doctors.php' target='_blank'>Test get_doctors.php</a></li>";
        echo "<li><a href='../index.html' target='_blank'>Home Page</a></li>";
        echo "<li><a href='check_db.php' target='_blank'>Database Check</a></li>";
        echo "</ul>";
        
    } catch(PDOException $e) {
        echo "<p class='error'>❌ Error: " . $e->getMessage() . "</p>";
        
        // Show SQL to run manually
        echo "<h3>Run this SQL manually in phpMyAdmin:</h3>";
        echo "<pre>";
        echo "USE doctor_appointment;\n\n";
        echo "-- Add users\n";
        echo "INSERT INTO users (name, email, password, phone, role) VALUES \n";
        echo "('Dr. John Smith', 'john.smith@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345678', 'doctor'),\n";
        echo "('Dr. Sarah Johnson', 'sarah.j@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345679', 'doctor'),\n";
        echo "('Dr. Michael Brown', 'michael.b@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345680', 'doctor'),\n";
        echo "('Dr. Emily Davis', 'emily.d@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345681', 'doctor'),\n";
        echo "('Dr. Robert Wilson', 'robert.w@example.com', '\$2y\$10\$V0J6VJm0b7y8a9Z9Y0XzU.1q2w3e4r5t6y7u8i9o0p', '01712345682', 'doctor');\n\n";
        
        echo "-- Get user IDs (run after above)\n";
        echo "SELECT id, name FROM users WHERE role = 'doctor' ORDER BY id DESC LIMIT 5;\n\n";
        
        echo "-- Add to doctors table (replace IDs with actual IDs)\n";
        echo "INSERT INTO doctors (user_id, specialization, experience, consultation_fee) VALUES \n";
        echo "(FOUND_USER_ID_1, 'Cardiologist', 10, 100),\n";
        echo "(FOUND_USER_ID_2, 'Dermatologist', 8, 80),\n";
        echo "(FOUND_USER_ID_3, 'Pediatrician', 12, 90),\n";
        echo "(FOUND_USER_ID_4, 'Neurologist', 15, 120),\n";
        echo "(FOUND_USER_ID_5, 'Orthopedic', 9, 110);\n";
        echo "</pre>";
    }
    ?>
    
    <script>
        // Test get_doctors.php after adding doctors
        setTimeout(function() {
            fetch('get_doctors.php')
                .then(response => response.json())
                .then(data => {
                    console.log('get_doctors.php response:', data);
                    if (data.length > 0 && !data.error) {
                        alert('✅ Doctors are now available! Refresh the home page to see them.');
                    }
                });
        }, 1000);
    </script>
</body>
</html>
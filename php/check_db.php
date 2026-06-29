<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html>
<head>
    <title>Database Check</title>
    <style>
        body { font-family: Arial; padding: 20px; }
        .success { color: green; font-weight: bold; }
        .error { color: red; font-weight: bold; }
        table { border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>Database Check</h1>
    
    <?php
    $host = 'localhost';
    $dbname = 'doctor_appointment';
    $username = 'root';
    $password = '';
    
    // Test connection
    try {
        $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
        echo "<p class='success'>✅ MySQL Connection Successful</p>";
        
        // Check if database exists
        $stmt = $pdo->query("SHOW DATABASES LIKE '$dbname'");
        if ($stmt->rowCount() > 0) {
            echo "<p class='success'>✅ Database '$dbname' exists</p>";
            
            // Connect to the database
            $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
            
            // Check tables
            $tables = ['users', 'doctors', 'appointments'];
            foreach ($tables as $table) {
                $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    echo "<p class='success'>✅ Table '$table' exists</p>";
                    
                    // Count rows
                    $count = $pdo->query("SELECT COUNT(*) as count FROM $table")->fetch()['count'];
                    echo "<p>Rows in $table: $count</p>";
                    
                    // Show data for users and doctors
                    if ($table === 'users' || $table === 'doctors') {
                        $data = $pdo->query("SELECT * FROM $table LIMIT 10")->fetchAll();
                        if (count($data) > 0) {
                            echo "<h3>Data in $table:</h3>";
                            echo "<table>";
                            // Header
                            echo "<tr>";
                            foreach (array_keys($data[0]) as $key) {
                                echo "<th>$key</th>";
                            }
                            echo "</tr>";
                            // Rows
                            foreach ($data as $row) {
                                echo "<tr>";
                                foreach ($row as $value) {
                                    echo "<td>" . htmlspecialchars($value) . "</td>";
                                }
                                echo "</tr>";
                            }
                            echo "</table>";
                        }
                    }
                } else {
                    echo "<p class='error'>❌ Table '$table' does not exist</p>";
                }
            }
            
            // Check doctors specifically
            echo "<h2>Doctors Check</h2>";
            $stmt = $pdo->query("
                SELECT u.id as user_id, u.name, u.email, u.role, d.specialization, d.experience, d.consultation_fee
                FROM users u 
                LEFT JOIN doctors d ON u.id = d.user_id 
                WHERE u.role = 'doctor'
            ");
            
            $doctors = $stmt->fetchAll();
            echo "<p>Found " . count($doctors) . " doctors</p>";
            
            if (count($doctors) > 0) {
                echo "<table>";
                echo "<tr><th>User ID</th><th>Name</th><th>Email</th><th>Role</th><th>Specialization</th><th>Experience</th><th>Fee</th></tr>";
                foreach ($doctors as $doctor) {
                    echo "<tr>";
                    echo "<td>" . $doctor['user_id'] . "</td>";
                    echo "<td>" . $doctor['name'] . "</td>";
                    echo "<td>" . $doctor['email'] . "</td>";
                    echo "<td>" . $doctor['role'] . "</td>";
                    echo "<td>" . ($doctor['specialization'] ?? 'NULL') . "</td>";
                    echo "<td>" . ($doctor['experience'] ?? '0') . "</td>";
                    echo "<td>$" . ($doctor['consultation_fee'] ?? '0') . "</td>";
                    echo "</tr>";
                }
                echo "</table>";
            } else {
                echo "<p class='error'>❌ No doctors found in database</p>";
            }
            
        } else {
            echo "<p class='error'>❌ Database '$dbname' does not exist</p>";
            echo "<p>Run this SQL to create database:</p>";
            echo "<pre>";
            echo "CREATE DATABASE doctor_appointment;\n";
            echo "USE doctor_appointment;\n";
            echo "-- Run the SQL from database.sql file";
            echo "</pre>";
        }
        
    } catch(PDOException $e) {
        echo "<p class='error'>❌ Connection failed: " . $e->getMessage() . "</p>";
    }
    ?>
    
    <h2>Test Direct Links:</h2>
    <ul>
        <li><a href="../php/get_doctors.php" target="_blank">Test get_doctors.php</a></li>
        <li><a href="../index.html" target="_blank">Home Page</a></li>
        <li><a href="../login.html" target="_blank">Login Page</a></li>
    </ul>
</body>
</html>
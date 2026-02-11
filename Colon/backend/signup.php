<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = trim($_POST['name']);
    $email = trim($_POST['email']);
    $password = $_POST['password'];
    $phone = trim($_POST['phone']);

    // Validate inputs
    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(["status"=>false, "message"=>"All fields are required"]);
        exit;
    }

    // Check if email already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();
    if($stmt->num_rows > 0){
        echo json_encode(["status"=>false, "message"=>"Email already registered"]);
        exit;
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Insert user
    $stmt = $conn->prepare("INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $hashed_password, $phone);
    if($stmt->execute()){
        echo json_encode(["status"=>true, "message"=>"Signup successful"]);
    } else {
        echo json_encode(["status"=>false, "message"=>"Signup failed"]);
    }
}
?>

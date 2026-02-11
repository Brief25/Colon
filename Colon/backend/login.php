<?php
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = trim($_POST['email']);
    $password = $_POST['password'];

    if(empty($email) || empty($password)){
        echo json_encode(["status"=>false, "message"=>"Email and password required"]);
        exit;
    }

    // Fetch user
    $stmt = $conn->prepare("SELECT id, full_name, password FROM users WHERE email=?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $stmt->store_result();

    if($stmt->num_rows == 0){
        echo json_encode(["status"=>false, "message"=>"User not found"]);
        exit;
    }

    $stmt->bind_result($id, $name, $hashed_password);
    $stmt->fetch();

    // Verify password
    if(password_verify($password, $hashed_password)){
        session_start();
        $_SESSION['user_id'] = $id;
        $_SESSION['user_name'] = $name;
        echo json_encode(["status"=>true, "message"=>"Login successful"]);
    } else {
        echo json_encode(["status"=>false, "message"=>"Incorrect password"]);
    }
}
?>

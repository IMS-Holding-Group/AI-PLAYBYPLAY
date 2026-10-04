<?php
$host = 'localhost';        // أو عنوان السيرفر
$db   = 'your_database';    // اسم قاعدة البيانات
$user = 'root';             // اسم المستخدم
$pass = '';                 // كلمة المرور

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die('Connection failed: ' . $conn->connect_error);
}
?>

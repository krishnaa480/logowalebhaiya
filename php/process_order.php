<?php
header("Content-Type: application/json");
require_once 'db_connect.php'; // Database connection file

$response = ['success' => false, 'message' => ''];

try {
    // Get POST data
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required = ['name', 'phone', 'address', 'city', 'pincode', 'state', 'quantity', 'logo_url'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Generate order ID
    $order_id = 'LWB' . date('Ymd') . strtoupper(substr(uniqid(), -6));
    
    // Process logo upload
    $logo_url = '';
    if (!empty($data['logo_base64'])) {
        $upload_dir = 'uploads/logos/';
        if (!file_exists($upload_dir)) {
            mkdir($upload_dir, 0777, true);
        }
        
        $logo_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $data['logo_base64']));
        $logo_name = $order_id . '_' . uniqid() . '.png';
        file_put_contents($upload_dir . $logo_name, $logo_data);
        $logo_url = $upload_dir . $logo_name;
    }
    
    // Save to database
    $stmt = $pdo->prepare("INSERT INTO orders 
        (order_id, name, phone, house_number, address, city, pincode, state, quantity, logo_url, payment_proof, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())");
    
    $stmt->execute([
        $order_id,
        $data['name'],
        $data['phone'],
        $data['house_number'] ?? '',
        $data['address'],
        $data['city'],
        $data['pincode'],
        $data['state'],
        $data['quantity'],
        $logo_url,
        $data['payment_proof_url'] ?? ''
    ]);
    
    $response = [
        'success' => true,
        'order_id' => $order_id,
        'message' => 'Order placed successfully'
    ];
    
    // Send email notification to admin
    sendOrderNotification($data, $order_id);
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);

function sendOrderNotification($data, $order_id) {
    $to = 'admin@logowalebhaiya.com';
    $subject = "New Order Received - $order_id";
    
    $message = "<h2>New Order Details</h2>";
    $message .= "<p><strong>Order ID:</strong> $order_id</p>";
    $message .= "<p><strong>Customer:</strong> {$data['name']}</p>";
    $message .= "<p><strong>Phone:</strong> {$data['phone']}</p>";
    $message .= "<p><strong>Address:</strong> {$data['house_number']}, {$data['address']}, {$data['city']} - {$data['pincode']}, {$data['state']}</p>";
    $message .= "<p><strong>Quantity:</strong> {$data['quantity']} sheets (".($data['quantity']*96)." stickers)</p>";
    $message .= "<p><strong>Total Amount:</strong> ₹".(($data['quantity']*90)+80)."</p>";
    
    if (!empty($data['logo_base64'])) {
        $message .= "<p><strong>Logo:</strong> <a href='".$_SERVER['HTTP_HOST'].$logo_url."'>View Logo</a></p>";
    }
    
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    
    mail($to, $subject, $message, $headers);
}
?>
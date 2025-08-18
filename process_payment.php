<?php
// Set your email addresses
$merchantEmail = "sitholesikhumbuzo1@gmail.com";  // Your business email
$adminEmail = "sitholesikhumbuzo80@gmail.com";    // Your personal/admin email

// Process PayFast ITN (Instant Transaction Notification)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Include PayFast library
    require_once('payfast_common.inc');
    
    // Verify signature
    $pfData = $_POST;
    $pfParamString = '';
    
    foreach ($pfData as $key => $val) {
        if ($key != 'signature') {
            $pfParamString .= $key . '=' . urlencode($val) . '&';
        }
    }
    
    $pfParamString = substr($pfParamString, 0, -1);
    $signature = md5($pfParamString);
    
    if ($signature != $pfData['signature']) {
        die('Invalid signature');
    }

    // Only process if payment is complete
    if ($pfData['payment_status'] == 'COMPLETE') {
        // Get order details from PayFast data
        $orderId = $pfData['m_payment_id'];
        $amount = $pfData['amount_gross'];
        $customerEmail = $pfData['email_address'];
        $customerName = $pfData['name_first'] . ' ' . $pfData['name_last'];
        
        // Prepare order items (assuming you passed these as custom fields)
        $orderItems = [];
        for ($i = 1; isset($pfData["item_name_$i"]); $i++) {
            $orderItems[] = [
                'name' => $pfData["item_name_$i"],
                'quantity' => (int)($pfData["amount_$i"] / $pfData["item_amount_$i"]),
                'price' => $pfData["item_amount_$i"]
            ];
        }

        // Send emails
        sendCustomerEmail($customerEmail, $customerName, $orderId, $orderItems, $amount);
        sendMerchantEmail($merchantEmail, $adminEmail, $customerEmail, $customerName, $orderId, $orderItems, $amount);
        
        // You should also save this order to your database here
        // saveOrderToDatabase($orderId, $customerEmail, $customerName, $orderItems, $amount);
    }
    
    // Return success to PayFast
    header('HTTP/1.0 200 OK');
}

function sendCustomerEmail($to, $name, $orderId, $orderItems, $total) {
    $subject = "Your Healthy Harvest Order #$orderId";
    
    // Build items list
    $itemsHtml = '';
    foreach ($orderItems as $item) {
        $itemsHtml .= "<tr>
            <td>{$item['name']}</td>
            <td>{$item['quantity']}</td>
            <td>R" . number_format($item['price'], 2) . "</td>
            <td>R" . number_format($item['price'] * $item['quantity'], 2) . "</td>
        </tr>";
    }
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <h2>Thank you for your order, $name!</h2>
        <p>Your order #$orderId has been received and is being processed.</p>
        
        <h3>Order Summary</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                $itemsHtml
                <tr>
                    <td colspan='3' style='text-align: right;'><strong>Grand Total</strong></td>
                    <td><strong>R" . number_format($total, 2) . "</strong></td>
                </tr>
            </tbody>
        </table>
        
        <p>We'll notify you when your order ships. If you have any questions, please reply to this email.</p>
        
        <p>Thanks,<br>The Pishon Team</p>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Pishon <no-reply@healthyharvest.com>\r\n";
    $headers .= "Reply-To: $merchantEmail\r\n";
    
    // Send email
    mail($to, $subject, $message, $headers);
}

function sendMerchantEmail($merchantEmail, $adminEmail, $customerEmail, $customerName, $orderId, $orderItems, $total) {
    $subject = "New Order #$orderId from $customerName";
    
    // Build items list
    $itemsHtml = '';
    foreach ($orderItems as $item) {
        $itemsHtml .= "<tr>
            <td>{$item['name']}</td>
            <td>{$item['quantity']}</td>
            <td>R" . number_format($item['price'], 2) . "</td>
            <td>R" . number_format($item['price'] * $item['quantity'], 2) . "</td>
        </tr>";
    }
    
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f5f5f5; }
        </style>
    </head>
    <body>
        <h2>New Order Received</h2>
        <p><strong>Order ID:</strong> #$orderId</p>
        <p><strong>Customer:</strong> $customerName ($customerEmail)</p>
        <p><strong>Total Amount:</strong> R" . number_format($total, 2) . "</p>
        
        <h3>Order Details</h3>
        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                $itemsHtml
            </tbody>
        </table>
        
        <p>This order requires processing and shipping.</p>
    </body>
    </html>
    ";
    
    // Email headers
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: Pishon Orders <orders@healthyharvest.com>\r\n";
    
    // Send to both merchant and admin emails
    mail($merchantEmail, $subject, $message, $headers);
    if ($merchantEmail != $adminEmail) {
        mail($adminEmail, $subject, $message, $headers);
    }
}
?>
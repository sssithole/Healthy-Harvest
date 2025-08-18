<?php
// PayFast ITN (Instant Transaction Notification) handler

// Set your merchant credentials
$merchantId = '10000100';
$merchantKey = '46f0cd694581a';

// Configure email addresses
$merchantEmail = 'your@business.com';
$adminEmail = 'admin@business.com';

// Validate the PayFast signature
$pfData = $_POST;
$pfParamString = '';
foreach($pfData as $key => $val) {
    if($key != 'signature') {
        $pfParamString .= $key .'='. urlencode($val) .'&';
    }
}
$pfParamString = substr($pfParamString, 0, -1);
$signature = md5($pfParamString);

if($signature != $pfData['signature']) {
    die('Invalid signature');
}

// Only process COMPLETE payments
if($pfData['payment_status'] == 'COMPLETE') {
    // Prepare order data
    $orderId = $pfData['m_payment_id'];
    $amount = $pfData['amount_gross'];
    $customerEmail = $pfData['email_address'];
    $customerName = $pfData['name_first'] . ' ' . $pfData['name_last'];
    
    // Build items list
    $items = [];
    for($i = 1; isset($pfData["item_name_$i"]); $i++) {
        $items[] = [
            'name' => $pfData["item_name_$i"],
            'quantity' => $pfData["quantity_$i"],
            'price' => $pfData["amount_$i"]
        ];
    }
    
    // Send confirmation email to customer
    $customerSubject = "Your Healthy Harvest Order #$orderId";
    $customerMessage = "Thank you for your order!\n\n";
    $customerMessage .= "Order ID: $orderId\n";
    $customerMessage .= "Total: R" . number_format($amount, 2) . "\n\n";
    $customerMessage .= "Items:\n";
    foreach($items as $item) {
        $customerMessage .= "- {$item['name']} (Qty: {$item['quantity']}) R" . 
                           number_format($item['price'], 2) . "\n";
    }
    mail($customerEmail, $customerSubject, $customerMessage);
    
    // Send notification to merchant
    $merchantSubject = "New Order #$orderId from $customerName";
    $merchantMessage = "New order received:\n\n";
    $merchantMessage .= "Customer: $customerName ($customerEmail)\n";
    $merchantMessage .= "Amount: R" . number_format($amount, 2) . "\n";
    mail($merchantEmail, $merchantSubject, $merchantMessage);
    mail($adminEmail, $merchantSubject, $merchantMessage);
}

// Return success to PayFast
header('HTTP/1.0 200 OK');
?>
<?php
// chatgpt_proxy.php

// === CORS Setup ===
// Allow requests from your production domain and local development environments.
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Update with the origins you wish to allow
    $allowed_origins = [
        'https://chris.totl.net',
        'http://localhost:5173',   
    ];
    
    if (in_array($_SERVER['HTTP_ORIGIN'], $allowed_origins)) {
        header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Methods: POST, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// === Read Incoming JSON Data ===
// The expected JSON should at least contain a key "message" that holds the user's prompt.
$input = file_get_contents("php://input");
$request_data = json_decode($input, true);

// Validate request data
if (!$request_data) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'Invalid JSON input', 'type' => 'invalid_request_error']]);
    exit;
}

// Ensure model parameter exists
if (!isset($request_data['model'])) {
    $request_data['model'] = 'gpt-3.5-turbo'; // Default model if not provided
}

// Ensure messages parameter exists
if (!isset($request_data['messages']) || empty($request_data['messages'])) {
    http_response_code(400);
    echo json_encode(['error' => ['message' => 'You must provide a messages parameter', 'type' => 'invalid_request_error']]);
    exit;
}

// === Set Up ChatGPT API Request ===
$apiKey = file_get_contents(__DIR__ . '/.api_key'); // Use __DIR__ to get current directory
$apiUrl = 'https://api.openai.com/v1/chat/completions';

// Initialize a cURL session.
$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($request_data));

// Send the request and capture the response.
$response = curl_exec($ch);

// Error handling for cURL.
if (curl_errno($ch)) {
    $error_msg = curl_error($ch);
}
curl_close($ch);

if (isset($error_msg)) {
    http_response_code(500);
    echo json_encode(['error' => $error_msg]);
    exit;
}

// Return the ChatGPT API response to the client.
header('Content-Type: application/json');
echo $response;
?>
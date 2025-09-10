<?php
// Set appropriate headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
    exit;
}

// Get the raw POST data
$jsonData = file_get_contents('php://input');
$data = json_decode($jsonData, true);

// Validate the received data
if (!$data || !isset($data['postId']) || !isset($data['name']) || !isset($data['email']) || !isset($data['content'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize the data
$postId = htmlspecialchars(strip_tags($data['postId']));
$name = htmlspecialchars(strip_tags($data['name']));
$email = htmlspecialchars(strip_tags($data['email']));
$content = htmlspecialchars(strip_tags($data['content']));
$date = date('Y-m-d H:i:s');

// Create a comment object
$comment = [
    'id' => uniqid(),
    'postId' => $postId,
    'name' => $name,
    'email' => $email, // Note: This should not be displayed publicly
    'content' => $content,
    'date' => $date,
    'approved' => true, // Set to false if you want manual approval
    'avatar' => "https://ui-avatars.com/api/?name=" . urlencode($name) . "&background=random"
];

// Path to the comments file
$commentsFile = 'comments.json';

// Check if the file exists and read existing comments
if (file_exists($commentsFile)) {
    $commentsJson = file_get_contents($commentsFile);
    $comments = json_decode($commentsJson, true);
    
    if (!$comments) {
        $comments = [];
    }
} else {
    // If the file doesn't exist, create an empty array
    $comments = [];
}

// Add the new comment
$comments[] = $comment;

// Save the updated comments back to the file
if (file_put_contents($commentsFile, json_encode($comments, JSON_PRETTY_PRINT))) {
    // Create a backup of the comments file
    $backupDir = 'backups';
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d_H-i-s');
    $backupFile = $backupDir . '/comments_' . $timestamp . '.json';
    copy($commentsFile, $backupFile);
    
    // Return success response
    echo json_encode([
        'success' => true, 
        'message' => 'Comment saved successfully',
        'comment' => $comment
    ]);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['success' => false, 'message' => 'Failed to save comment']);
}
?>

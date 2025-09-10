<?php
// Set appropriate headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

// Check if the request is a GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405); // Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Only GET requests are allowed']);
    exit;
}

// Check if postId parameter is provided
if (!isset($_GET['postId'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Post ID is required']);
    exit;
}

// Get and sanitize the post ID
$postId = htmlspecialchars(strip_tags($_GET['postId']));

// Path to the comments file
$commentsFile = 'comments.json';

// Check if the file exists and read existing comments
if (file_exists($commentsFile)) {
    $commentsJson = file_get_contents($commentsFile);
    $allComments = json_decode($commentsJson, true);
    
    if (!$allComments) {
        $allComments = [];
    }
    
    // Filter comments for the specific post and that are approved
    $postComments = array_filter($allComments, function($comment) use ($postId) {
        return $comment['postId'] === $postId && $comment['approved'] === true;
    });
    
    // Sort comments by date (newest first)
    usort($postComments, function($a, $b) {
        return strtotime($b['date']) - strtotime($a['date']);
    });
    
    // Return the comments
    echo json_encode([
        'success' => true,
        'comments' => array_values($postComments) // array_values reindexes the array
    ]);
} else {
    // If the file doesn't exist, return an empty array
    echo json_encode([
        'success' => true,
        'comments' => []
    ]);
}
?>

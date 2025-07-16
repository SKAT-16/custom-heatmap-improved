<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Only POST allowed']);
    exit;
}
require './db.php';
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['session_id']) || !isset($input['event']) || !isset($input['url'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}
$session_id = $input['session_id'];
$event = $input['event'];
$url = $input['url'];
$xPercent = $input['xPercent'] ?? null;
$yPercent = $input['yPercent'] ?? null;
$scrollDepth = $input['scrollDepth'] ?? null;
$timeSpent = $input['timeSpent'] ?? null;
$tag = $input['tag'] ?? null;
$screenWidth = $input['screen']['width'] ?? null;
$screenHeight = $input['screen']['height'] ?? null;
$timestamp = $input['timestamp'] ?? date('c');
$metadata = isset($input['metadata']) ? json_encode($input['metadata']) : null;
try {
    $stmt = $db->prepare("INSERT INTO interactions (
        session_id, event, url, xPercent, yPercent, scrollDepth, timeSpent,
        tag, screenWidth, screenHeight, timestamp, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$session_id, $event, $url, $xPercent, $yPercent, $scrollDepth,
                    $timeSpent, $tag, $screenWidth, $screenHeight, $timestamp, $metadata]);
    echo json_encode(['status' => 'ok']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'DB Insert failed', 'details' => $e->getMessage()]);
}

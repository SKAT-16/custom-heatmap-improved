<?php
// track.php
header("Content-Type: application/json");
// date_default_timezone_set("Africa/Addis_Ababa");

// Decode incoming JSON
$data = json_decode(file_get_contents("php://input"), true);

// Basic validation
if (!$data || !isset($data['event']) || !isset($data['session_id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid input"]);
    exit;
}

// Setup SQLite connection (adjust path if needed)
try {
    $db = new PDO("sqlite:../db/heatmap.db");
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed", "details" => $e->getMessage()]);
    exit;
}

// Create the events table if not exists
$db->exec("
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event TEXT NOT NULL,
        tag TEXT,
        url TEXT,
        screen_width INTEGER,
        screen_height INTEGER,
        x_percent REAL,
        y_percent REAL,
        scroll_depth INTEGER,
        time_spent REAL,
        timestamp TEXT NOT NULL
    )
");

// Prepare data for insertion
$stmt = $db->prepare("
    INSERT INTO events (
        session_id,
        event,
        tag,
        url,
        screen_width,
        screen_height,
        x_percent,
        y_percent,
        scroll_depth,
        time_spent,
        timestamp
    ) VALUES (
        :session_id,
        :event,
        :tag,
        :url,
        :screen_width,
        :screen_height,
        :x_percent,
        :y_percent,
        :scroll_depth,
        :time_spent,
        :timestamp
    )
");

// Execute insert
$stmt->execute([
    ':session_id'    => $data['session_id'],
    ':event'         => $data['event'],
    ':tag'           => $data['tag'] ?? null,
    ':url'           => $data['url'] ?? '',
    ':screen_width'  => $data['screen']['width'] ?? null,
    ':screen_height' => $data['screen']['height'] ?? null,
    ':x_percent'     => $data['xPercent'] ?? null,
    ':y_percent'     => $data['yPercent'] ?? null,
    ':scroll_depth'  => $data['scrollDepth'] ?? null,
    ':time_spent'    => $data['timeSpent'] ?? null,
    ':timestamp'     => $data['timestamp'] ?? date("c"),
]);

echo json_encode(["status" => "ok"]);

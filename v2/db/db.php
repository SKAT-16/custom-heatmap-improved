<?php
$dbFile = __DIR__ . '/../db/heatmap.db'; // Ensure same path as track.php

try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
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
    
    echo "✅ Table 'events' created successfully.";
} catch (PDOException $e) {
    die("❌ DB Error: " . $e->getMessage());
}

<?php
$dbFile = __DIR__ . '/interactions.db';
try {
    $db = new PDO('sqlite:' . $dbFile);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("
        CREATE TABLE IF NOT EXISTS interactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            event TEXT,
            url TEXT,
            xPercent REAL,
            yPercent REAL,
            scrollDepth INTEGER,
            timeSpent REAL,
            tag TEXT,
            screenWidth INTEGER,
            screenHeight INTEGER,
            timestamp TEXT,
            metadata TEXT
        )
    ");
} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}

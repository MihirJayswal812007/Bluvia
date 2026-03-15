<?php
// Handle CORS
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Authorization, Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Load .env variables if .env file exists
if (file_exists(__DIR__ . '/.env')) {
    $lines = file(__DIR__ . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $_ENV[trim($name)] = trim($value);
    }
}

// Global Exception Handler
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit();
});

// Routing
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Base path might be /Bluvia/server_php/ if running from WAMP htdocs, so let's strip that generic prefix.
// We expect paths like /api/products
$prefix = '/api';
$pos = strpos($requestUri, $prefix);
if ($pos !== false) {
    $path = substr($requestUri, $pos); // Get e.g. /api/products
} else {
    $path = $requestUri;
}

$method = $_SERVER['REQUEST_METHOD'];

// Helper functions for auth
require_once __DIR__ . '/middleware/auth.php';
// Setup DB
require_once __DIR__ . '/db.php';

header("Content-Type: application/json");

// Simple router
if (str_starts_with($path, '/api/auth')) {
    require __DIR__ . '/routes/auth.php';
} elseif (str_starts_with($path, '/api/products')) {
    require __DIR__ . '/routes/products.php';
} elseif (str_starts_with($path, '/api/orders')) {
    require __DIR__ . '/routes/orders.php';
} elseif (str_starts_with($path, '/api/admin')) {
    require __DIR__ . '/routes/admin.php';
} elseif ($path === '/api/health') {
    echo json_encode(['status' => 'OK', 'time' => date('Y-m-d H:i:s')]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

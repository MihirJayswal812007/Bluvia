<?php
global $pdo;

$subpath = str_replace('/api/admin', '', $path);

if ($method === 'GET' && $subpath === '/dashboard') {
    requireAdmin();

    $stmt = $pdo->query('SELECT COUNT(*) as users FROM users WHERE role="user"');
    $userCount = $stmt->fetch()['users'];

    $stmt = $pdo->query('SELECT COUNT(*) as orders, SUM(total_paise) as revenue FROM orders WHERE status != "cancelled"');
    $orderStats = $stmt->fetch();

    $stmt = $pdo->query('SELECT COUNT(*) as low_stock FROM inventory WHERE stock_quantity < 50');
    $lowStock = $stmt->fetch()['low_stock'];

    echo json_encode([
        'users' => $userCount,
        'orders' => $orderStats['orders'],
        'revenue' => $orderStats['revenue'],
        'low_stock' => $lowStock
    ]);
    exit();

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

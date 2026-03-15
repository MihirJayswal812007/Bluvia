<?php
global $pdo, $req_user;

$subpath = str_replace('/api/orders', '', $path);
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST' && ($subpath === '/' || $subpath === '')) {
    requireAuth();
    $items = $input['items'] ?? [];
    $shipping_address = $input['shipping_address'] ?? null;

    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['error' => 'No items provided']);
        exit();
    }

    try {
        $pdo->beginTransaction();

        $total = 0;
        foreach ($items as $item) {
            $stmt = $pdo->prepare('SELECT price_paise FROM products WHERE id=? AND active=1');
            $stmt->execute([$item['product_id']]);
            $prod = $stmt->fetch();
            if (!$prod) throw new Exception("Product {$item['product_id']} not found");
            $total += $prod['price_paise'] * $item['quantity'];
        }

        $delivery_fee = 500;
        $gst = round($total * 0.18);
        $total = $total + $delivery_fee + $gst;

        $stmt = $pdo->prepare('INSERT INTO orders (user_id, total_paise, shipping_address, status) VALUES (?, ?, ?, ?)');
        $stmt->execute([$req_user['id'], $total, $shipping_address, 'confirmed']);
        $orderId = $pdo->lastInsertId();

        foreach ($items as $item) {
            $stmt = $pdo->prepare('SELECT price_paise FROM products WHERE id=?');
            $stmt->execute([$item['product_id']]);
            $prod = $stmt->fetch();

            $stmt2 = $pdo->prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price_paise) VALUES (?, ?, ?, ?)');
            $stmt2->execute([$orderId, $item['product_id'], $item['quantity'], $prod['price_paise']]);

            $stmt3 = $pdo->prepare('UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE product_id=?');
            $stmt3->execute([$item['quantity'], $item['product_id']]);
        }

        $pdo->commit();
        http_response_code(201);
        echo json_encode(['order_id' => $orderId, 'total_paise' => $total, 'status' => 'confirmed']);
    } catch (\Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit();

} elseif ($method === 'GET' && ($subpath === '/' || $subpath === '')) {
    requireAuth();
    $stmt = $pdo->prepare("
        SELECT o.*,
            (SELECT JSON_ARRAYAGG(JSON_OBJECT(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'unit_price_paise', oi.unit_price_paise,
                'product_name', p.name
            ))
            FROM order_items oi
            LEFT JOIN products p ON p.id = oi.product_id
            WHERE oi.order_id = o.id
            ) AS items
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$req_user['id']]);
    $orders = $stmt->fetchAll();
    
    foreach ($orders as &$order) {
        if (isset($order['items'])) {
            $order['items'] = json_decode($order['items'], true);
        } else {
            $order['items'] = [];
        }
    }
    echo json_encode(['orders' => $orders]);
    exit();

} elseif ($method === 'GET' && $subpath === '/all') {
    requireAdmin();
    $stmt = $pdo->query("
        SELECT o.*, u.email, u.full_name
        FROM orders o
        LEFT JOIN users u ON u.id = o.user_id
        ORDER BY o.created_at DESC
        LIMIT 200
    ");
    $orders = $stmt->fetchAll();
    echo json_encode(['orders' => $orders]);
    exit();

} elseif ($method === 'PATCH' && preg_match('#^/(\d+)/status$#', $subpath, $matches)) {
    requireAdmin();
    $id = $matches[1];
    $status = $input['status'] ?? null;
    $valid = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($status, $valid)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid status']);
        exit();
    }

    $stmt = $pdo->prepare('UPDATE orders SET status=?, updated_at=NOW() WHERE id=?');
    $stmt->execute([$status, $id]);

    echo json_encode(['success' => true]);
    exit();

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

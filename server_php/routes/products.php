<?php
global $pdo;

$subpath = str_replace('/api/products', '', $path);
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'GET' && ($subpath === '/' || $subpath === '')) {
    $stmt = $pdo->query("
        SELECT p.*, i.stock_quantity
        FROM products p
        LEFT JOIN inventory i ON i.product_id = p.id
        WHERE p.active = 1
        ORDER BY p.price_paise ASC
    ");
    $products = $stmt->fetchAll();
    foreach ($products as &$p) {
        if (isset($p['specs'])) {
            $p['specs'] = json_decode($p['specs'], true) ?? [];
        }
    }
    echo json_encode(['products' => $products]);
    exit();

} elseif ($method === 'GET' && preg_match('#^/(\d+)$#', $subpath, $matches)) {
    $id = $matches[1];
    $stmt = $pdo->prepare("
        SELECT p.*, i.stock_quantity
        FROM products p
        LEFT JOIN inventory i ON i.product_id = p.id
        WHERE p.id = ?
    ");
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) {
        http_response_code(404);
        echo json_encode(['error' => 'Product not found']);
        exit();
    }
    if (isset($product['specs'])) {
        $product['specs'] = json_decode($product['specs'], true) ?? [];
    }
    echo json_encode(['product' => $product]);
    exit();

} elseif ($method === 'POST' && ($subpath === '/' || $subpath === '')) {
    requireAdmin();
    $name = $input['name'] ?? null;
    $desc = $input['description'] ?? null;
    $price = $input['price_paise'] ?? null;
    $vol = $input['volume_ml'] ?? null;
    $specs = json_encode($input['specs'] ?? []);

    $stmt = $pdo->prepare('INSERT INTO products (name, description, price_paise, volume_ml, specs) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$name, $desc, $price, $vol, $specs]);
    $id = $pdo->lastInsertId();

    $stmt2 = $pdo->prepare('INSERT INTO inventory (product_id, stock_quantity) VALUES (?, ?)');
    $stmt2->execute([$id, 0]);

    http_response_code(201);
    echo json_encode(['id' => $id]);
    exit();

} elseif ($method === 'PATCH' && preg_match('#^/(\d+)$#', $subpath, $matches)) {
    requireAdmin();
    $id = $matches[1];
    $name = $input['name'] ?? null;
    $desc = $input['description'] ?? null;
    $price = $input['price_paise'] ?? null;
    $active = $input['active'] ?? null;

    $stmt = $pdo->prepare("UPDATE products SET name=COALESCE(?,name), description=COALESCE(?,description), price_paise=COALESCE(?,price_paise), active=COALESCE(?,active) WHERE id=?");
    $stmt->execute([$name, $desc, $price, $active, $id]);

    echo json_encode(['success' => true]);
    exit();

} elseif ($method === 'PATCH' && preg_match('#^/(\d+)/stock#', $subpath, $matches)) {
    requireAdmin();
    $id = $matches[1];
    $stock = $input['stock_quantity'] ?? null;

    $stmt = $pdo->prepare("UPDATE inventory SET stock_quantity=? WHERE product_id=?");
    $stmt->execute([$stock, $id]);

    echo json_encode(['success' => true]);
    exit();

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

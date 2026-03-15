<?php
global $pdo, $req_user;

$subpath = str_replace('/api/auth', '', $path);
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST' && $subpath === '/signup') {
    $full_name = $input['full_name'] ?? null;
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;

    if (!$email || !$password || !$full_name) {
        http_response_code(400);
        echo json_encode(['error' => 'Name, email and password are required']);
        exit();
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Email already in use']);
        exit();
    }

    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)');
    $stmt->execute([$full_name, $email, $hash, 'user']);
    $insertId = $pdo->lastInsertId();

    $user = [
        'id' => $insertId,
        'full_name' => $full_name,
        'email' => $email,
        'role' => 'user'
    ];
    $token = SimpleJWT::encode($user, $_ENV['JWT_SECRET']);
    echo json_encode(['token' => $token, 'user' => $user]);
    exit();

} elseif ($method === 'POST' && $subpath === '/login') {
    $email = $input['email'] ?? null;
    $password = $input['password'] ?? null;
    
    if (!$email || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password required']);
        exit();
    }

    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $userRow = $stmt->fetch();

    if (!$userRow || !password_verify($password, $userRow['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit();
    }

    $payload = [
        'id' => $userRow['id'],
        'full_name' => $userRow['full_name'],
        'email' => $userRow['email'],
        'role' => $userRow['role']
    ];
    // Optional: Add expiration support
    $token = SimpleJWT::encode($payload, $_ENV['JWT_SECRET']);
    echo json_encode(['token' => $token, 'user' => $payload]);
    exit();

} elseif ($method === 'GET' && $subpath === '/me') {
    requireAuth();
    echo json_encode(['user' => $req_user]);
    exit();

} else {
    http_response_code(404);
    echo json_encode(['error' => 'Route not found']);
}

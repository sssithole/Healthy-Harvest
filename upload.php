<?php
// =============================================================
// upload.php — Admin API (login · logout · session check · upload)
// All responses are JSON. Called by admin.html via fetch().
// =============================================================

require_once __DIR__ . '/config.php';

// ── Bootstrap secure session ─────────────────────────────────
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);

session_name(ADMIN_SESSION_NAME);
session_start();

// ── CORS / headers ───────────────────────────────────────────
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');

// ── Route by ?action= ────────────────────────────────────────
$action = $_GET['action'] ?? $_POST['action'] ?? '';

switch ($action) {
    case 'login':   handleLogin();   break;
    case 'logout':  handleLogout();  break;
    case 'check':   handleCheck();   break;
    case 'upload':  handleUpload();  break;
    default:        jsonError('Unknown action', 400);
}

// =============================================================
// LOGIN
// POST upload.php?action=login   body: { password }
// =============================================================
function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed', 405);
    }

    $body     = json_decode(file_get_contents('php://input'), true);
    $password = $body['password'] ?? '';

    // Plain string comparison — password lives only in config.php
    // which is blocked from browser access by .htaccess
    if (!$password || $password !== ADMIN_PASSWORD) {
        // Small delay to slow brute-force attempts
        sleep(1);
        jsonError('Incorrect password', 401);
    }

    // Regenerate session ID on successful login (session fixation protection)
    session_regenerate_id(true);
    $_SESSION['admin_authed']  = true;
    $_SESSION['admin_login_ts'] = time();

    jsonOk(['message' => 'Logged in']);
}

// =============================================================
// LOGOUT
// POST upload.php?action=logout
// =============================================================
function handleLogout() {
    $_SESSION = [];
    session_destroy();
    jsonOk(['message' => 'Logged out']);
}

// =============================================================
// SESSION CHECK
// GET upload.php?action=check
// Returns { authed: true/false }
// =============================================================
function handleCheck() {
    $authed = !empty($_SESSION['admin_authed']) &&
              (time() - ($_SESSION['admin_login_ts'] ?? 0)) < SESSION_LIFETIME;

    if (!$authed) {
        // Clear stale session
        $_SESSION = [];
    }

    jsonOk(['authed' => $authed]);
}

// =============================================================
// IMAGE UPLOAD
// POST upload.php?action=upload   multipart/form-data  file: image
// Requires active admin session.
// Returns { url: './image/filename.ext' }
// =============================================================
function handleUpload() {
    // Must be authenticated
    if (empty($_SESSION['admin_authed'])) {
        jsonError('Unauthorised', 401);
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        jsonError('Method not allowed', 405);
    }

    if (!isset($_FILES['image'])) {
        jsonError('No file received', 400);
    }

    $file = $_FILES['image'];

    // Check for PHP upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $msgs = [
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit',
            UPLOAD_ERR_PARTIAL    => 'File only partially uploaded',
            UPLOAD_ERR_NO_FILE    => 'No file uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temp folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION  => 'Upload blocked by PHP extension',
        ];
        jsonError($msgs[$file['error']] ?? 'Upload error', 400);
    }

    // Size check
    if ($file['size'] > MAX_UPLOAD_BYTES) {
        jsonError('File too large (max ' . (MAX_UPLOAD_BYTES / 1024 / 1024) . ' MB)', 400);
    }

    // MIME type check — use finfo for reliability, not the browser-supplied type
    $finfo    = new finfo(FILEINFO_MIME_TYPE);
    $mimeType = $finfo->file($file['tmp_name']);

    if (!in_array($mimeType, ALLOWED_MIME_TYPES, true)) {
        jsonError('Invalid file type. Allowed: JPG, PNG, WEBP, GIF', 400);
    }

    // Build a safe, unique filename
    $ext         = mimeToExt($mimeType);
    $safeName    = preg_replace('/[^a-z0-9_-]/', '', strtolower(pathinfo($file['name'], PATHINFO_FILENAME)));
    $safeName    = $safeName ?: 'product';
    $safeName    = substr($safeName, 0, 60);
    $filename    = $safeName . '_' . uniqid() . '.' . $ext;
    $destination = IMAGE_DIR . $filename;

    // Ensure image directory exists and is writable
    if (!is_dir(IMAGE_DIR)) {
        if (!mkdir(IMAGE_DIR, 0755, true)) {
            jsonError('Could not create image directory', 500);
        }
    }

    if (!is_writable(IMAGE_DIR)) {
        jsonError('Image directory is not writable. Check folder permissions (755).', 500);
    }

    // Move the uploaded file
    if (!move_uploaded_file($file['tmp_name'], $destination)) {
        jsonError('Failed to save file', 500);
    }

    // Return the public URL path for use in admin.html / products store
    jsonOk(['url' => './image/' . $filename]);
}

// =============================================================
// Helpers
// =============================================================
function mimeToExt($mime) {
    $map = [
        'image/jpeg' => 'jpg',
        'image/png'  => 'png',
        'image/webp' => 'webp',
        'image/gif'  => 'gif',
    ];
    return $map[$mime] ?? 'jpg';
}

function jsonOk(array $data) {
    echo json_encode(array_merge(['ok' => true], $data));
    exit;
}

function jsonError(string $message, int $status = 400) {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

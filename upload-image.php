<?php
// filepath: c:\xampp\htdocs\PRJ1\WebSite\upload-image.php
/**
 * Blog görsel yükleme işlemlerini yapan betik
 * Blog yazarlarının yükledikleri görselleri işler ve sunucuya kaydeder
 */

// Hata raporlamayı ayarla
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS ayarları (gerekirse düzenleyin)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Sadece POST isteklerine izin ver
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Sadece POST istekleri kabul edilir']);
    exit;
}

// Yükleme dizinini ayarla
$uploadDir = 'images/blog/';

// Dizin yoksa oluştur
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Dosya yükleme kontrolü
if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    $errorMessage = 'Dosya yükleme hatası: ';
    
    if (isset($_FILES['image'])) {
        switch ($_FILES['image']['error']) {
            case UPLOAD_ERR_INI_SIZE:
                $errorMessage .= 'Dosya boyutu PHP yapılandırmasındaki limitin üzerinde.';
                break;
            case UPLOAD_ERR_FORM_SIZE:
                $errorMessage .= 'Dosya boyutu formda belirtilen limitin üzerinde.';
                break;
            case UPLOAD_ERR_PARTIAL:
                $errorMessage .= 'Dosya kısmen yüklendi.';
                break;
            case UPLOAD_ERR_NO_FILE:
                $errorMessage .= 'Dosya yüklenmedi.';
                break;
            case UPLOAD_ERR_NO_TMP_DIR:
                $errorMessage .= 'Geçici klasör bulunamadı.';
                break;
            case UPLOAD_ERR_CANT_WRITE:
                $errorMessage .= 'Dosya diske yazılamadı.';
                break;
            case UPLOAD_ERR_EXTENSION:
                $errorMessage .= 'Bir PHP uzantısı dosya yüklemeyi durdurdu.';
                break;
            default:
                $errorMessage .= 'Bilinmeyen bir hata oluştu.';
                break;
        }
    }
    
    echo json_encode(['success' => false, 'message' => $errorMessage]);
    exit;
}

// Dosya bilgilerini al
$file = $_FILES['image'];
$fileName = $file['name'];
$fileTmpName = $file['tmp_name'];
$fileSize = $file['size'];
$fileType = $file['type'];

// Dosya türü kontrolü
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
if (!in_array($fileType, $allowedTypes)) {
    echo json_encode(['success' => false, 'message' => 'Sadece JPEG, PNG, GIF ve WEBP formatları desteklenir']);
    exit;
}

// Dosya boyutu kontrolü (5MB max)
if ($fileSize > 5 * 1024 * 1024) {
    echo json_encode(['success' => false, 'message' => 'Dosya boyutu 5MB\'ı geçemez']);
    exit;
}

// Benzersiz bir dosya adı oluştur
$fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
$newFileName = uniqid('blog_') . '.' . $fileExtension;
$uploadPath = $uploadDir . $newFileName;

// Dosyayı taşı
if (move_uploaded_file($fileTmpName, $uploadPath)) {
    // Başarılı yanıt
    echo json_encode([
        'success' => true, 
        'message' => 'Dosya başarıyla yüklendi',
        'file' => [
            'name' => $newFileName,
            'url' => $uploadPath,
            'type' => $fileType,
            'size' => $fileSize
        ]
    ]);
} else {
    // Başarısız yanıt
    echo json_encode(['success' => false, 'message' => 'Dosya yükleme başarısız oldu']);
}

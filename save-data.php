<?php
// Hata raporlamayı aç
error_reporting(E_ALL);
ini_set('display_errors', 1);

// JSON yanıt başlığı
header('Content-Type: application/json');

// CORS ayarları
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // 24 saat

// OPTIONS isteğini handle et
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Request başlangıç bilgisini logla
error_log('Veri kaydetme isteği başladı: ' . date('Y-m-d H:i:s'));

try {
    // JSON verisini al
    $json = file_get_contents('php://input');
    
    if (empty($json)) {
        throw new Exception('Boş JSON verisi alındı');
    }
    
    // JSON geçerli mi kontrol et
    $data = json_decode($json, true);
    if ($data === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Geçersiz JSON verisi: ' . json_last_error_msg());
    }
    
    // Check if this is an encrypted data request for the journal
    if (isset($data['path']) && isset($data['data'])) {
        // Path güvenliği kontrolü
        $allowedPaths = ['assets/secretdata.json'];
        if (!in_array($data['path'], $allowedPaths)) {
            throw new Exception('Güvenlik: İzin verilmeyen dosya yolu');
        }
        
        // Get the encrypted data
        $encryptedData = $data['data'];
        
        // Create a backup of the existing file if it exists and is not empty
        if (file_exists($data['path']) && filesize($data['path']) > 0) {
            $backupDir = 'backups';
            if (!is_dir($backupDir)) {
                mkdir($backupDir, 0755, true);
            }
            
            $backupFile = $backupDir . '/data_' . date('Y-m-d_H-i-s') . '.json';
            copy($data['path'], $backupFile);
            error_log('Günlük verisi yedeklendi: ' . $backupFile);
        }
        
        // Save the encrypted data to the file
        $success = file_put_contents($data['path'], $encryptedData);
        
        if ($success === false) {
            throw new Exception('Şifreli veri kaydedilemedi');
        }
        
        error_log('Şifreli veri başarıyla kaydedildi: ' . $data['path']);
        echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
        exit;
    }
    
    // Eğer buraya geldiyse normal blog yazıları vs. için
    if (!isset($data['blogPosts']) || !is_array($data['blogPosts'])) {
        throw new Exception('Geçersiz veri yapısı: blogPosts alanı eksik veya yanlış formatta');
    }

    // Yedekleme dizini oluştur
    $backup_dir = dirname(__FILE__) . '/backups';
    if (!file_exists($backup_dir)) {
        if (!mkdir($backup_dir, 0755, true)) {
            error_log('Yedekleme dizini oluşturulamadı: ' . $backup_dir);
        }
    }
    
    // Mevcut dosyanın yedeğini oluştur
    $data_file = dirname(__FILE__) . '/data.json';
    if (file_exists($data_file)) {
        $backup_file = $backup_dir . '/data_' . date('Y-m-d_H-i-s') . '.json';
        
        if (!copy($data_file, $backup_file)) {
            error_log('Yedek oluşturulamadı: ' . $backup_file);
        } else {
            error_log('Yedek oluşturuldu: ' . $backup_file);
        }
    }

    // data.json dosyasına kaydet
    $result = file_put_contents($data_file, $json);
    if ($result === false) {
        throw new Exception('data.json dosyasına yazılamadı. Dosya erişim izinlerini kontrol edin.');
    }
    
    error_log('data.json başarıyla güncellendi. Yazılan byte: ' . $result);
    
    // Eski yedekleri temizle (son 10 tanesini sakla)
    $backups = glob($backup_dir . '/data_*.json');
    if (count($backups) > 10) {
        usort($backups, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        $to_delete = array_slice($backups, 0, count($backups) - 10);
        foreach ($to_delete as $file) {
            if (unlink($file)) {
                error_log('Eski yedek silindi: ' . $file);
            } else {
                error_log('Eski yedek silinemedi: ' . $file);
            }
        }
    }

    // Başarılı yanıt döndür
    echo json_encode([
        'success' => true,
        'message' => 'Veriler başarıyla kaydedildi',
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    // Hata durumunda
    http_response_code(500);
    error_log('Veri kaydetme hatası: ' . $e->getMessage());
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
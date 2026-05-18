<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    $pdo->exec('CREATE DATABASE IF NOT EXISTS saas_kuat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    echo "Banco 'saas_kuat' criado com sucesso!\n";
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

-- Database schema untuk Candice Kids Daycare Management System

-- Buat database
CREATE DATABASE IF NOT EXISTS candice_kids CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE candice_kids;

-- Tabel Users (Admin dan Orang Tua)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'orang_tua') NOT NULL,
    nama VARCHAR(100) NOT NULL,
    telepon VARCHAR(20),
    alamat TEXT,
    foto VARCHAR(255),
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Pengasuh
CREATE TABLE pengasuh (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telepon VARCHAR(20),
    alamat TEXT,
    tanggal_lahir DATE,
    jenis_kelamin ENUM('L', 'P'),
    pendidikan VARCHAR(100),
    pengalaman TEXT,
    foto VARCHAR(255),
    tanggal_bergabung DATE,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabel Anak
CREATE TABLE anak (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nama VARCHAR(100) NOT NULL,
    tanggal_lahir DATE NOT NULL,
    jenis_kelamin ENUM('L', 'P') NOT NULL,
    alamat TEXT,
    telepon_darurat VARCHAR(20),
    kondisi_kesehatan TEXT,
    alergi TEXT,
    foto VARCHAR(255),
    orang_tua_id INT,
    pengasuh_id INT,
    tanggal_masuk DATE,
    status ENUM('aktif', 'nonaktif') DEFAULT 'aktif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orang_tua_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (pengasuh_id) REFERENCES pengasuh(id) ON DELETE SET NULL
);

-- Tabel Absensi
CREATE TABLE absensi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    anak_id INT NOT NULL,
    tanggal DATE NOT NULL,
    waktu_masuk TIME,
    waktu_keluar TIME,
    status ENUM('hadir', 'sakit', 'izin', 'alpha') NOT NULL,
    keterangan TEXT,
    suhu_tubuh DECIMAL(4,2),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_daily_attendance (anak_id, tanggal)
);

-- Tabel Aktivitas Harian
CREATE TABLE aktivitas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    anak_id INT NOT NULL,
    pengasuh_id INT,
    tanggal DATE NOT NULL,
    jenis_aktivitas ENUM('belajar', 'bermain', 'makan', 'tidur', 'olahraga', 'seni', 'lainnya') NOT NULL,
    deskripsi TEXT NOT NULL,
    waktu_mulai TIME,
    waktu_selesai TIME,
    foto VARCHAR(255),
    video VARCHAR(255),
    catatan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(id) ON DELETE CASCADE,
    FOREIGN KEY (pengasuh_id) REFERENCES pengasuh(id) ON DELETE SET NULL
);

-- Tabel Komunikasi (Chat/Pesan)
CREATE TABLE komunikasi (
    id INT PRIMARY KEY AUTO_INCREMENT,
    pengirim_id INT NOT NULL,
    penerima_id INT NOT NULL,
    pesan TEXT NOT NULL,
    jenis ENUM('chat', 'notifikasi', 'pengumuman') DEFAULT 'chat',
    status ENUM('terkirim', 'dibaca') DEFAULT 'terkirim',
    file_attachment VARCHAR(255),
    anak_id INT, -- jika pesan terkait anak tertentu
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pengirim_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (penerima_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (anak_id) REFERENCES anak(id) ON DELETE SET NULL
);

-- Tabel Tagihan
CREATE TABLE tagihan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orang_tua_id INT NOT NULL,
    anak_id INT NOT NULL,
    periode_bulan VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    jenis_tagihan ENUM('bulanan', 'pendaftaran', 'kegiatan', 'lainnya') NOT NULL,
    jumlah DECIMAL(12,2) NOT NULL,
    deskripsi TEXT,
    tanggal_jatuh_tempo DATE,
    status ENUM('belum_bayar', 'sebagian', 'lunas') DEFAULT 'belum_bayar',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (orang_tua_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (anak_id) REFERENCES anak(id) ON DELETE CASCADE
);

-- Tabel Pembayaran
CREATE TABLE pembayaran (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tagihan_id INT NOT NULL,
    jumlah_bayar DECIMAL(12,2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    metode_pembayaran ENUM('tunai', 'transfer', 'kartu', 'ewallet') NOT NULL,
    bukti_pembayaran VARCHAR(255),
    keterangan TEXT,
    verified_by INT,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (tagihan_id) REFERENCES tagihan(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabel Notifikasi Darurat
CREATE TABLE notifikasi_darurat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    anak_id INT NOT NULL,
    jenis_darurat ENUM('kesehatan', 'kecelakaan', 'kehilangan', 'lainnya') NOT NULL,
    deskripsi TEXT NOT NULL,
    tindakan_diambil TEXT,
    status ENUM('aktif', 'ditangani', 'selesai') DEFAULT 'aktif',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (anak_id) REFERENCES anak(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert sample data
-- Admin user
INSERT INTO users (username, email, password, role, nama, telepon) VALUES 
('admin', 'admin@candicekids.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Administrator', '081234567890');

-- Sample orang tua
INSERT INTO users (email, password, role, nama, telepon, alamat) VALUES 
('ayah.aisyah@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'orang_tua', 'Budi Santoso', '081234567891', 'Jl. Melati No. 123, Jakarta'),
('ibu.ahmad@email.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'orang_tua', 'Sari Indah', '081234567892', 'Jl. Mawar No. 456, Jakarta');

-- Sample pengasuh
INSERT INTO pengasuh (nama, email, telepon, tanggal_lahir, jenis_kelamin, pendidikan, tanggal_bergabung) VALUES 
('Bu Sari Nurlaila', 'sari@candicekids.com', '081234567893', '1985-03-15', 'P', 'S1 Pendidikan Anak Usia Dini', '2020-01-15'),
('Bu Nina Kartika', 'nina@candicekids.com', '081234567894', '1988-07-22', 'P', 'D3 Psikologi Anak', '2021-06-01');

-- Sample anak
INSERT INTO anak (nama, tanggal_lahir, jenis_kelamin, orang_tua_id, pengasuh_id, tanggal_masuk) VALUES 
('Aisyah Putri Santoso', '2019-05-10', 'P', 2, 1, '2023-01-15'),
('Ahmad Rizki Indah', '2018-12-03', 'L', 3, 2, '2023-02-01');

-- Sample absensi hari ini
INSERT INTO absensi (anak_id, tanggal, waktu_masuk, status, suhu_tubuh, created_by) VALUES 
(1, CURDATE(), '07:30:00', 'hadir', 36.5, 1),
(2, CURDATE(), '08:00:00', 'hadir', 36.3, 1);

-- Sample aktivitas
INSERT INTO aktivitas (anak_id, tanggal, jenis_aktivitas, deskripsi, waktu_mulai, waktu_selesai, pengasuh_id) VALUES 
(1, CURDATE(), 'bermain', 'Bermain puzzle dan balok susun', '09:00:00', '10:00:00', 1),
(2, CURDATE(), 'belajar', 'Belajar mengenal huruf dan angka', '09:30:00', '10:30:00', 2);

-- Sample tagihan
INSERT INTO tagihan (orang_tua_id, anak_id, periode_bulan, jenis_tagihan, jumlah, deskripsi, tanggal_jatuh_tempo) VALUES 
(2, 1, '2024-07', 'bulanan', 1500000, 'Biaya daycare bulan Juli 2024', '2024-07-10'),
(3, 2, '2024-07', 'bulanan', 1500000, 'Biaya daycare bulan Juli 2024', '2024-07-10');

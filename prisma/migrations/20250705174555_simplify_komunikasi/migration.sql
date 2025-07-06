-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'orang_tua') NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `telepon` VARCHAR(20) NULL,
    `alamat` TEXT NULL,
    `foto` VARCHAR(255) NULL,
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pengasuh` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NULL,
    `telepon` VARCHAR(20) NULL,
    `alamat` TEXT NULL,
    `tanggal_lahir` DATE NULL,
    `jenis_kelamin` ENUM('L', 'P') NULL,
    `pendidikan` VARCHAR(100) NULL,
    `pengalaman` TEXT NULL,
    `foto` VARCHAR(255) NULL,
    `tanggal_bergabung` DATE NULL,
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pengasuh_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `anak` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `tanggal_lahir` DATE NOT NULL,
    `jenis_kelamin` ENUM('L', 'P') NOT NULL,
    `alamat` TEXT NULL,
    `telepon_darurat` VARCHAR(20) NULL,
    `kondisi_kesehatan` TEXT NULL,
    `alergi` TEXT NULL,
    `foto` VARCHAR(255) NULL,
    `orang_tua_id` INTEGER NULL,
    `tanggal_masuk` DATE NULL,
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anak_id` INTEGER NOT NULL,
    `tanggal` DATE NOT NULL,
    `status` ENUM('hadir', 'alpha') NOT NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `absensi_anak_id_tanggal_key`(`anak_id`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aktivitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tanggal` DATE NOT NULL,
    `nama_aktivitas` VARCHAR(100) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `waktu_mulai` TIME NULL,
    `waktu_selesai` TIME NULL,
    `foto` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `komunikasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pengirim_id` INTEGER NOT NULL,
    `penerima_id` INTEGER NOT NULL,
    `pesan` TEXT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tagihan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orang_tua_id` INTEGER NOT NULL,
    `anak_id` INTEGER NOT NULL,
    `periode_bulan` VARCHAR(7) NOT NULL,
    `jenis_tagihan` ENUM('bulanan', 'pendaftaran', 'kegiatan', 'lainnya') NOT NULL,
    `jumlah` DECIMAL(12, 2) NOT NULL,
    `deskripsi` TEXT NULL,
    `tanggal_jatuh_tempo` DATE NULL,
    `status` ENUM('belum_bayar', 'sebagian', 'lunas') NOT NULL DEFAULT 'belum_bayar',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pembayaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tagihan_id` INTEGER NOT NULL,
    `jumlah_bayar` DECIMAL(12, 2) NOT NULL,
    `tanggal_bayar` DATE NOT NULL,
    `metode_pembayaran` ENUM('tunai', 'transfer', 'kartu', 'ewallet') NOT NULL,
    `bukti_pembayaran` VARCHAR(255) NULL,
    `keterangan` TEXT NULL,
    `verified_by` INTEGER NULL,
    `status` ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifikasi_darurat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anak_id` INTEGER NOT NULL,
    `jenis_darurat` ENUM('kesehatan', 'kecelakaan', 'kehilangan', 'lainnya') NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `tindakan_diambil` TEXT NULL,
    `status` ENUM('aktif', 'ditangani', 'selesai') NOT NULL DEFAULT 'aktif',
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `anak` ADD CONSTRAINT `anak_orang_tua_id_fkey` FOREIGN KEY (`orang_tua_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_anak_id_fkey` FOREIGN KEY (`anak_id`) REFERENCES `anak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `komunikasi` ADD CONSTRAINT `komunikasi_pengirim_id_fkey` FOREIGN KEY (`pengirim_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `komunikasi` ADD CONSTRAINT `komunikasi_penerima_id_fkey` FOREIGN KEY (`penerima_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagihan` ADD CONSTRAINT `tagihan_orang_tua_id_fkey` FOREIGN KEY (`orang_tua_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagihan` ADD CONSTRAINT `tagihan_anak_id_fkey` FOREIGN KEY (`anak_id`) REFERENCES `anak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_tagihan_id_fkey` FOREIGN KEY (`tagihan_id`) REFERENCES `tagihan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pembayaran` ADD CONSTRAINT `pembayaran_verified_by_fkey` FOREIGN KEY (`verified_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi_darurat` ADD CONSTRAINT `notifikasi_darurat_anak_id_fkey` FOREIGN KEY (`anak_id`) REFERENCES `anak`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi_darurat` ADD CONSTRAINT `notifikasi_darurat_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

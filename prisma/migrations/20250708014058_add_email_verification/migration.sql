/*
  Warnings:

  - The values [failure] on the enum `pembayaran_transaction_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `absensi` MODIFY `status` ENUM('hadir', 'alpha', 'sakit', 'izin') NOT NULL;

-- AlterTable
ALTER TABLE `pembayaran` MODIFY `transaction_status` ENUM('pending', 'capture', 'settlement', 'deny', 'cancel', 'expire', 'refund', 'partial_refund', 'chargeback', 'partial_chargeback', 'authorize') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `tagihan` MODIFY `status` ENUM('belum_bayar', 'lunas', 'sebagian') NOT NULL DEFAULT 'belum_bayar';

-- AlterTable
ALTER TABLE `users` ADD COLUMN `email_verification_expires` DATETIME(3) NULL,
    ADD COLUMN `email_verification_token` VARCHAR(255) NULL,
    ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `status` ENUM('aktif', 'nonaktif', 'pending') NOT NULL DEFAULT 'aktif';

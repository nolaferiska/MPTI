/*
  Warnings:

  - You are about to drop the column `bukti_pembayaran` on the `pembayaran` table. All data in the column will be lost.
  - You are about to drop the column `tanggal_bayar` on the `pembayaran` table. All data in the column will be lost.
  - You are about to drop the column `verified_by` on the `pembayaran` table. All data in the column will be lost.
  - A unique constraint covering the columns `[order_id]` on the table `pembayaran` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `gross_amount` to the `pembayaran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order_id` to the `pembayaran` table without a default value. This is not possible if the table is not empty.

*/

-- DropForeignKey
ALTER TABLE `pembayaran` DROP FOREIGN KEY `pembayaran_verified_by_fkey`;

-- AlterTable
ALTER TABLE `pembayaran` 
DROP COLUMN `bukti_pembayaran`,
DROP COLUMN `tanggal_bayar`,
DROP COLUMN `verified_by`,
ADD COLUMN `bank_code` VARCHAR(10),
ADD COLUMN `expired_at` DATETIME(3),
ADD COLUMN `fraud_status` VARCHAR(20),
ADD COLUMN `gross_amount` DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN `midtrans_response` TEXT,
ADD COLUMN `order_id` VARCHAR(100) NOT NULL DEFAULT '',
ADD COLUMN `payment_type` VARCHAR(50),
ADD COLUMN `payment_url` TEXT,
ADD COLUMN `transaction_id` VARCHAR(200),
ADD COLUMN `transaction_status` ENUM('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'failure', 'refund', 'partial_refund') NOT NULL DEFAULT 'pending',
ADD COLUMN `transaction_time` DATETIME(3),
ADD COLUMN `va_number` VARCHAR(50);

-- Update existing records with unique order_id
UPDATE `pembayaran` SET 
  `order_id` = CONCAT('LEGACY-', id, '-', UNIX_TIMESTAMP()),
  `gross_amount` = `jumlah_bayar`
WHERE `order_id` = '';

-- CreateIndex
CREATE UNIQUE INDEX `pembayaran_order_id_key` ON `pembayaran`(`order_id`);

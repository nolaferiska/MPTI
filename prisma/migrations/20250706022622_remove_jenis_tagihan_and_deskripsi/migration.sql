/*
  Warnings:

  - You are about to drop the column `jenis_darurat` on the `notifikasi_darurat` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `notifikasi_darurat` table. All the data in the column will be lost.
  - You are about to drop the column `tindakan_diambil` on the `notifikasi_darurat` table. All the data in the column will be lost.
  - You are about to drop the column `metode_pembayaran` on the `pembayaran` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `pembayaran` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi` on the `tagihan` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_tagihan` on the `tagihan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notifikasi_darurat` DROP COLUMN `jenis_darurat`,
    DROP COLUMN `status`,
    DROP COLUMN `tindakan_diambil`;

-- AlterTable
ALTER TABLE `pembayaran` DROP COLUMN `metode_pembayaran`,
    DROP COLUMN `status`,
    ALTER COLUMN `gross_amount` DROP DEFAULT,
    ALTER COLUMN `order_id` DROP DEFAULT;

-- AlterTable
ALTER TABLE `tagihan` DROP COLUMN `deskripsi`,
    DROP COLUMN `jenis_tagihan`;

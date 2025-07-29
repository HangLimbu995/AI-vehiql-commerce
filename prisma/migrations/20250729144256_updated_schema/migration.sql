/*
  Warnings:

  - The values [TUDESDAY] on the enum `dayOfWeek` will be removed. If these variants are still used in the database, this will fail.
  - The `isOpen` column on the `WorkingHour` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `closeTime` to the `WorkingHour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "dayOfWeek_new" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');
ALTER TABLE "WorkingHour" ALTER COLUMN "dayOfWeek" TYPE "dayOfWeek_new" USING ("dayOfWeek"::text::"dayOfWeek_new");
ALTER TYPE "dayOfWeek" RENAME TO "dayOfWeek_old";
ALTER TYPE "dayOfWeek_new" RENAME TO "dayOfWeek";
DROP TYPE "dayOfWeek_old";
COMMIT;

-- AlterTable
ALTER TABLE "WorkingHour" ADD COLUMN     "closeTime" TEXT NOT NULL,
DROP COLUMN "isOpen",
ADD COLUMN     "isOpen" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "WorkingHour_isOpen_idx" ON "WorkingHour"("isOpen");

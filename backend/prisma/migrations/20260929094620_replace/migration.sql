/*
  Warnings:

  - The values [USER,MESSAGE] on the enum `ReportTargetType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportTargetType_new" AS ENUM ('OPPORTUNITY', 'CONVERSATION');
ALTER TABLE "reports" ALTER COLUMN "targetType" TYPE "ReportTargetType_new" USING ("targetType"::text::"ReportTargetType_new");
ALTER TYPE "ReportTargetType" RENAME TO "ReportTargetType_old";
ALTER TYPE "ReportTargetType_new" RENAME TO "ReportTargetType";
DROP TYPE "ReportTargetType_old";
COMMIT;

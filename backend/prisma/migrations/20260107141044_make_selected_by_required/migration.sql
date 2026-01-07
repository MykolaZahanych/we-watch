/*
  Warnings:

  - Made the column `selected_by` on table `movies` required. This step will fail if there are existing NULL values in that column.

*/
-- Update existing NULL values to use the user's nickname as default
UPDATE "movies" m
SET "selected_by" = u.nickname
FROM "users" u
WHERE m."selected_by" IS NULL AND m."user_id" = u."id";

-- AlterTable
ALTER TABLE "movies" ALTER COLUMN "selected_by" SET NOT NULL;

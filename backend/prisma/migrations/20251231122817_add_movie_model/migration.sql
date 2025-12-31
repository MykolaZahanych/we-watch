-- CreateEnum
CREATE TYPE "MovieStatus" AS ENUM ('NEED_TO_WATCH', 'COMPLETED', 'REJECTED');

-- CreateTable
CREATE TABLE "movies" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "link" TEXT,
    "comments" TEXT,
    "rating" SMALLINT,
    "status" "MovieStatus" NOT NULL DEFAULT 'NEED_TO_WATCH',
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "movies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "movies_user_id_idx" ON "movies"("user_id");

-- CreateIndex
CREATE INDEX "movies_status_idx" ON "movies"("status");

-- AddForeignKey
ALTER TABLE "movies" ADD CONSTRAINT "movies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "movies" ADD COLUMN     "preview_image_url" TEXT;

-- CreateIndex
CREATE INDEX "movies_link_idx" ON "movies"("link");

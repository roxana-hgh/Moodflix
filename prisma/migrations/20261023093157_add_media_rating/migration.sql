-- CreateTable
CREATE TABLE "media_rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "mediaType" "ListMediaType" NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "media_rating_tmdbId_mediaType_createdAt_idx" ON "media_rating"("tmdbId", "mediaType", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "media_rating_userId_tmdbId_mediaType_key" ON "media_rating"("userId", "tmdbId", "mediaType");

-- AddForeignKey
ALTER TABLE "media_rating" ADD CONSTRAINT "media_rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

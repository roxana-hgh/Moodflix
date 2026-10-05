-- CreateTable
CREATE TABLE "favorite_character" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "characterName" TEXT NOT NULL,
    "actorId" INTEGER NOT NULL,
    "actorName" TEXT NOT NULL,
    "profilePath" TEXT,
    "mediaTmdbId" INTEGER NOT NULL,
    "mediaType" "ListMediaType" NOT NULL,
    "mediaTitle" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_character_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "favorite_character_userId_addedAt_idx" ON "favorite_character"("userId", "addedAt");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_character_userId_mediaTmdbId_mediaType_characterNa_key" ON "favorite_character"("userId", "mediaTmdbId", "mediaType", "characterName");

-- AddForeignKey
ALTER TABLE "favorite_character" ADD CONSTRAINT "favorite_character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

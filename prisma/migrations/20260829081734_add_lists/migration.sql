-- CreateEnum
CREATE TYPE "ListType" AS ENUM ('WATCHLIST', 'FAVORITE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ListMediaType" AS ENUM ('MOVIE', 'TV');

-- CreateTable
CREATE TABLE "list" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ListType" NOT NULL,
    "name" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "list_item" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "mediaType" "ListMediaType" NOT NULL,
    "title" TEXT NOT NULL,
    "posterPath" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "list_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "list_userId_idx" ON "list"("userId");

-- CreateIndex
CREATE INDEX "list_item_listId_idx" ON "list_item"("listId");

-- CreateIndex
CREATE UNIQUE INDEX "list_item_listId_tmdbId_mediaType_key" ON "list_item"("listId", "tmdbId", "mediaType");

-- AddForeignKey
ALTER TABLE "list" ADD CONSTRAINT "list_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_item" ADD CONSTRAINT "list_item_listId_fkey" FOREIGN KEY ("listId") REFERENCES "list"("id") ON DELETE CASCADE ON UPDATE CASCADE;

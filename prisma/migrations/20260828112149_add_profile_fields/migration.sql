-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "gender" "Gender";

/*
  Warnings:

  - Added the required column `userId` to the `StudyMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudyMaterial" ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "uploadId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StudyMaterial" ADD CONSTRAINT "StudyMaterial_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

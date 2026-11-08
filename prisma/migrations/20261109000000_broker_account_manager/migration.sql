-- AlterTable
ALTER TABLE "User" ADD COLUMN     "accountManagerId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


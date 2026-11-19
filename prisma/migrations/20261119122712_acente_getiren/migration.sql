-- AlterTable
ALTER TABLE "User" ADD COLUMN     "introducedById" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_introducedById_fkey" FOREIGN KEY ("introducedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

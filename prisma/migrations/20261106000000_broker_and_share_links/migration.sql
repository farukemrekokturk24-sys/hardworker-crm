-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "referredById" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "company" TEXT,
ADD COLUMN     "shareCode" TEXT;

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "label" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "lastOpenedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_userId_idx" ON "ShareLink"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_shareCode_key" ON "User"("shareCode");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;


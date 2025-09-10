-- CreateTable
CREATE TABLE "EncryptedNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userAddress" TEXT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "EncryptedNote_userAddress_idx" ON "EncryptedNote"("userAddress");

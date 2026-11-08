-- CreateTable
CREATE TABLE "WhatsAppOtp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppOtp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WhatsAppOtp_userId_phone_idx" ON "WhatsAppOtp"("userId", "phone");

-- CreateIndex
CREATE INDEX "WhatsAppOtp_expiresAt_idx" ON "WhatsAppOtp"("expiresAt");

-- AddForeignKey
ALTER TABLE "WhatsAppOtp" ADD CONSTRAINT "WhatsAppOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

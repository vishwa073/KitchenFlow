-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "selectedOutletId" TEXT;

-- CreateIndex
CREATE INDEX "Address_selectedOutletId_idx" ON "Address"("selectedOutletId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_selectedOutletId_fkey" FOREIGN KEY ("selectedOutletId") REFERENCES "Outlet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

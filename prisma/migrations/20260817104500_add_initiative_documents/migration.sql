-- CreateTable
CREATE TABLE "InitiativeDocument" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "blobPathname" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "initiativeId" TEXT NOT NULL,

    CONSTRAINT "InitiativeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InitiativeDocument_blobUrl_key" ON "InitiativeDocument"("blobUrl");

-- CreateIndex
CREATE INDEX "InitiativeDocument_initiativeId_createdAt_idx" ON "InitiativeDocument"("initiativeId", "createdAt");

-- AddForeignKey
ALTER TABLE "InitiativeDocument" ADD CONSTRAINT "InitiativeDocument_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;

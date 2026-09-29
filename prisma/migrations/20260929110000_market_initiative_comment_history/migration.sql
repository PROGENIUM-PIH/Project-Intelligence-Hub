CREATE TABLE "MarketInitiativeComment" (
  "id" TEXT NOT NULL,
  "marketInitiativeId" TEXT NOT NULL,
  "rolloutStage" TEXT NOT NULL,
  "comment" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketInitiativeComment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "MarketInitiativeComment_marketInitiativeId_createdAt_idx"
ON "MarketInitiativeComment"("marketInitiativeId", "createdAt");

ALTER TABLE "MarketInitiativeComment"
ADD CONSTRAINT "MarketInitiativeComment_marketInitiativeId_fkey"
FOREIGN KEY ("marketInitiativeId") REFERENCES "MarketInitiative"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

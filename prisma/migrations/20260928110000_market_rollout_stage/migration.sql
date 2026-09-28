ALTER TABLE "MarketInitiative"
ADD COLUMN "rolloutStage" TEXT NOT NULL DEFAULT 'NO_INTEREST_YET';

ALTER TABLE "MarketInitiative"
ADD COLUMN "statusComment" TEXT;

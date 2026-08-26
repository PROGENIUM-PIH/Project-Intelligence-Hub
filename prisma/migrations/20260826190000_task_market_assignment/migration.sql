ALTER TABLE "Task" ALTER COLUMN "initiativeId" DROP NOT NULL;
ALTER TABLE "Task" ADD COLUMN "marketId" TEXT;

CREATE INDEX "Task_marketId_idx" ON "Task"("marketId");

ALTER TABLE "Task" ADD CONSTRAINT "Task_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;

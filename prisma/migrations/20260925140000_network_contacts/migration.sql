CREATE TABLE "Contact" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "MarketContact" (
  "marketId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  CONSTRAINT "MarketContact_pkey" PRIMARY KEY ("marketId","contactId")
);

CREATE TABLE "InitiativeContact" (
  "initiativeId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  CONSTRAINT "InitiativeContact_pkey" PRIMARY KEY ("initiativeId","contactId")
);

ALTER TABLE "MarketContact" ADD CONSTRAINT "MarketContact_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MarketContact" ADD CONSTRAINT "MarketContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InitiativeContact" ADD CONSTRAINT "InitiativeContact_initiativeId_fkey" FOREIGN KEY ("initiativeId") REFERENCES "Initiative"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InitiativeContact" ADD CONSTRAINT "InitiativeContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

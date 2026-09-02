-- Add five additional Market Steering markets without changing existing market data.
INSERT INTO "Market" ("id","name","code","region","lead","status","createdAt","updatedAt") VALUES
('market-ie','Ireland','IE','Western Europe','TBD','ON_TRACK',NOW(),NOW()),
('market-it','Italy','IT','Southern Europe','TBD','ON_TRACK',NOW(),NOW()),
('market-se','Sweden','SE','Northern Europe','TBD','ON_TRACK',NOW(),NOW()),
('market-sk','Slovakia','SK','Central Europe','TBD','ON_TRACK',NOW(),NOW()),
('market-be','Belgium','BE','Western Europe','TBD','ON_TRACK',NOW(),NOW())
ON CONFLICT ("code") DO UPDATE SET
  "name"=EXCLUDED."name",
  "region"=EXCLUDED."region",
  "lead"='TBD',
  "updatedAt"=NOW();

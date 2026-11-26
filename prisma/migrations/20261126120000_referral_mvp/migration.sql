-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "ReferralEventType" AS ENUM ('OPEN', 'KASPI_CLICK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE "BonusKind" AS ENUM ('CREDIT', 'PAYOUT', 'CORRECTION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "referralCode" TEXT;
ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "bonusBalance" INTEGER NOT NULL DEFAULT 0;

WITH numbered AS (
  SELECT id, 'COCO' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "createdAt") AS TEXT), 3, '0') AS code
  FROM "Partner"
  WHERE "referralCode" IS NULL
)
UPDATE "Partner" p SET "referralCode" = n.code FROM numbered n WHERE p.id = n.id;

CREATE UNIQUE INDEX IF NOT EXISTS "Partner_referralCode_key" ON "Partner"("referralCode");
CREATE UNIQUE INDEX IF NOT EXISTS "Partner_email_key" ON "Partner"("email");

ALTER TABLE "Partner" ALTER COLUMN "referralCode" SET NOT NULL;
ALTER TABLE "Partner" ALTER COLUMN "status" SET DEFAULT 'APPROVED';

ALTER TABLE "AuthCode" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "AuthCode" ALTER COLUMN "phone" SET DEFAULT '';
CREATE INDEX IF NOT EXISTS "AuthCode_email_createdAt_idx" ON "AuthCode"("email", "createdAt");

CREATE TABLE IF NOT EXISTS "ReferralEvent" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "productId" TEXT,
    "type" "ReferralEventType" NOT NULL,
    "visitorId" TEXT NOT NULL,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "referer" TEXT,
    "source" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReferralEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ReferralEvent_partnerId_type_createdAt_idx" ON "ReferralEvent"("partnerId", "type", "createdAt");
CREATE INDEX IF NOT EXISTS "ReferralEvent_partnerId_visitorId_type_idx" ON "ReferralEvent"("partnerId", "visitorId", "type");
CREATE INDEX IF NOT EXISTS "ReferralEvent_productId_createdAt_idx" ON "ReferralEvent"("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "ReferralEvent_createdAt_idx" ON "ReferralEvent"("createdAt");

DO $$ BEGIN
  ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ReferralEvent" ADD CONSTRAINT "ReferralEvent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "BonusLedger" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amountKzt" INTEGER NOT NULL,
    "kind" "BonusKind" NOT NULL,
    "comment" TEXT NOT NULL,
    "adminActor" TEXT NOT NULL,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BonusLedger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BonusLedger_idempotencyKey_key" ON "BonusLedger"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "BonusLedger_partnerId_createdAt_idx" ON "BonusLedger"("partnerId", "createdAt");

DO $$ BEGIN
  ALTER TABLE "BonusLedger" ADD CONSTRAINT "BonusLedger_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

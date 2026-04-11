-- AT-2 Path B: add impressions + clicks for CTR/CPM formulas
ALTER TABLE "entries" ADD COLUMN "impressions" INTEGER;
ALTER TABLE "entries" ADD COLUMN "clicks" INTEGER;

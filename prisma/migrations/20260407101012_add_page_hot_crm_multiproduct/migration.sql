-- AlterTable
ALTER TABLE "entries" ADD COLUMN     "crmOrders" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "crmProductId" INTEGER,
ADD COLUMN     "hotSales" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "pageId" INTEGER;

-- CreateTable
CREATE TABLE "pages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entry_products" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "entry_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pages_name_key" ON "pages"("name");

-- CreateIndex
CREATE INDEX "entry_products_entryId_idx" ON "entry_products"("entryId");

-- CreateIndex
CREATE INDEX "entry_products_productId_idx" ON "entry_products"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "entry_products_entryId_productId_key" ON "entry_products"("entryId", "productId");

-- CreateIndex
CREATE INDEX "entries_pageId_idx" ON "entries"("pageId");

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entries" ADD CONSTRAINT "entries_crmProductId_fkey" FOREIGN KEY ("crmProductId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_products" ADD CONSTRAINT "entry_products_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entry_products" ADD CONSTRAINT "entry_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

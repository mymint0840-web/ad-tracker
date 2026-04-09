import { z } from 'zod';

export const entrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  accountId: z.number().int().positive(),
  productId: z.number().int().positive(),
  pageId: z.number().int().positive().optional(),
  adCost: z.number().min(0),
  messages: z.number().int().min(0),
  closed: z.number().int().min(0),
  orders: z.number().int().min(0),
  salesFromPage: z.number().min(0),
  quantity: z.number().int().min(0),
  hotSales: z.number().min(0).default(0),
  crmOrders: z.number().int().min(0).default(0),
  crmProductId: z.number().int().positive().optional(),
  crmSales: z.number().min(0).default(0),
  crmQty: z.number().int().min(0).default(0),
  shippingCost: z.number().min(0).default(0),
  packingCost: z.number().min(0).default(0),
  adminCommission: z.number().min(0).default(0),
  products: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(0) })).optional(),
  crmProducts: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(0) })).optional(),
  note: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  cost: z.number().min(0, 'ต้นทุนต้องไม่ติดลบ'),
  price: z.number().min(0, 'ราคาขายต้องไม่ติดลบ'),
  stock: z.number().int().min(0, 'สต๊อกต้องไม่ติดลบ'),
});

export const accountSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อบัญชี'),
});

export const targetSchema = z.object({
  profit: z.number().min(0),
  adPercent: z.number().min(0).max(100),
  closeRate: z.number().min(0).max(100),
  costPerClick: z.number().min(0),
});

export const filterSchema = z.object({
  date: z.string().optional(),
  accountId: z.coerce.number().int().optional(),
  productId: z.coerce.number().int().optional(),
  pageId: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

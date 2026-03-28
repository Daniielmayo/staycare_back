import { z } from "zod";

export const createInvoiceSchema = z.object({
  body: z.object({
    client_id: z.number().int().positive(),
    order_ids: z.array(z.number().int().positive()).min(1),
    due_date: z.string().min(1, "due_date is required"),
    line_items: z
      .array(
        z.object({
          description: z.string().min(1),
          quantity: z.number().int().positive(),
          unit_price: z.number().positive(),
          total_price: z.number().positive(),
        }),
      )
      .min(1),
    subtotal: z.number().nonnegative(),
    vat_percentage: z.number().nonnegative().default(18),
    vat_amount: z.number().nonnegative(),
    total: z.number().nonnegative(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    method: z.enum(["cash", "bank_transfer", "card"]),
    transaction_reference: z.string().min(1),
  }),
  params: z.object({ id: z.string() }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>["body"];
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>["body"];

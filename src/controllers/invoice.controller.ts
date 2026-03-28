import { Request, Response } from "express";
import { InvoiceService } from "../services/invoice.service";
import { sendSuccess, sendError } from "../utils/response";
import { parsePagination, paginationMeta } from "../utils/paginate";

export const createInvoice = async (req: Request, res: Response) => {
  try {
    const { client_id, order_ids, due_date, line_items, subtotal, vat_percentage, vat_amount, total } = req.body;

    const invoice = await InvoiceService.createInvoice({
      client_id: Number(client_id),
      order_ids: (order_ids as any[]).map(Number),
      due_date,
      line_items,
      subtotal,
      vat_percentage,
      vat_amount,
      total,
    });

    return sendSuccess(res, 201, "Invoice created", invoice);
  } catch (error: any) {
    return sendError(res, 400, error.message || "Invoice creation failed");
  }
};

export const getAllInvoices = async (req: Request, res: Response) => {
  try {
    const { status, from, to } = req.query;
    const filter: { status?: string; client_id?: number | string; from?: string; to?: string } = {};
    if (status) filter.status = status as string;
    if (from) filter.from = from as string;
    if (to) filter.to = to as string;

    if (req.user!.role === "client") {
      const clientId = await InvoiceService.getClientIdForUser(Number(req.user!.userId));
      if (!clientId) {
        // No linked profile → return empty
        return sendSuccess(res, 200, "Invoices retrieved", [], paginationMeta(0, 1, 20));
      }
      filter.client_id = clientId;
    } else if (req.query.client_id) {
      filter.client_id = req.query.client_id as string;
    }

    const { page, limit, skip } = parsePagination(req);
    const { invoices, total } = await InvoiceService.getAllInvoices(filter, limit, skip);

    return sendSuccess(res, 200, "Invoices retrieved", invoices, paginationMeta(total, page, limit));
  } catch (error: any) {
    return sendError(res, 400, error.message || "Failed to fetch invoices");
  }
};

export const getInvoiceById = async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.id);
    if (isNaN(invoiceId)) return sendError(res, 400, "Invalid invoice ID");

    const invoice = await InvoiceService.getInvoiceById(invoiceId);
    if (!invoice) return sendError(res, 404, "Invoice not found");

    // Authorization check for client role
    if (req.user!.role === "client") {
      const clientId = await InvoiceService.getClientIdForUser(Number(req.user!.userId));
      if (!clientId || invoice.client_id !== clientId) {
        return sendError(res, 403, "Forbidden");
      }
    }

    return sendSuccess(res, 200, "Invoice retrieved", invoice);
  } catch (error: any) {
    return sendError(res, 400, error.message || "Failed to fetch invoice");
  }
};

export const recordPayment = async (req: Request, res: Response) => {
  try {
    const invoiceId = Number(req.params.id);
    if (isNaN(invoiceId)) return sendError(res, 400, "Invalid invoice ID");

    const { amount, method, transaction_reference } = req.body;

    const invoice = await InvoiceService.recordPayment(invoiceId, {
      amount: Number(amount),
      method,
      transaction_reference,
    });

    return sendSuccess(res, 200, "Payment recorded", invoice);
  } catch (error: any) {
    const status = error.status ?? 400;
    return sendError(res, status, error.message || "Payment recording failed");
  }
};

export const markOverdue = async (_req: Request, res: Response) => {
  try {
    const affectedRows = await InvoiceService.markOverdue();
    return sendSuccess(res, 200, "Overdue invoices updated", { affectedRows });
  } catch (error: any) {
    return sendError(res, 400, error.message || "Failed to update overdue invoices");
  }
};

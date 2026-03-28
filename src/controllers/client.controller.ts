import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess, sendError } from "../utils/response";
import { paginationMeta } from "../utils/paginate";
import { AppError } from "../utils/AppError";

export const getAllClients = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const { rows, total } = await UserService.listUsersWithClientProfilesPaginated(page, limit);
    return sendSuccess(res, 200, "Clients retrieved", rows, paginationMeta(total, page, limit));
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to fetch clients");
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const clientProfileId = Number(req.params.id);
    if (isNaN(clientProfileId)) return sendError(res, 400, "Invalid client ID");
    
    // Check ownership if client
    if (req.user!.role === "client") {
      const isOwner = await UserService.userOwnsClientProfile(req.user!.userId, clientProfileId);
      if (!isOwner) return sendError(res, 403, "Forbidden");
    }

    const detail = await UserService.getUserDetailByClientProfileId(clientProfileId);
    if (!detail) return sendError(res, 404, "Client not found");
    return sendSuccess(res, 200, "Client retrieved", detail);
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to fetch client");
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const clientProfileId = Number(req.params.id);
    if (isNaN(clientProfileId)) return sendError(res, 400, "Invalid client ID");

    // Check ownership if client
    if (req.user!.role === "client") {
      const isOwner = await UserService.userOwnsClientProfile(req.user!.userId, clientProfileId);
      if (!isOwner) return sendError(res, 403, "Forbidden");
    }

    await UserService.updateClientProfile(clientProfileId, req.body);
    return sendSuccess(res, 200, "Client updated");
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to update client");
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const clientProfileId = Number(req.params.id);
    if (isNaN(clientProfileId)) return sendError(res, 400, "Invalid client ID");
    
    await UserService.deleteUserByClientProfileId(clientProfileId);
    return sendSuccess(res, 200, "Client deleted");
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to delete client");
  }
};

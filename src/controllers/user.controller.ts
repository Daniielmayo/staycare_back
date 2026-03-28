import type { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { sendSuccess, sendError } from "../utils/response";
import { parsePagination, paginationMeta } from "../utils/paginate";
import { AppError } from "../utils/AppError";

function stripUserSecrets<T extends { password_hash?: string; refresh_token?: string | null }>(u: T) {
  const { password_hash, refresh_token, ...rest } = u;
  return rest;
}

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: |
 *     Gestión de usuarios (`users`). La gestión de sedes se ha movido a `/api/properties`.
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Listar usuarios (paginado)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 25 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [admin, staff, driver, client] }
 *       - in: query
 *         name: is_active
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, is_active } = req.query;
    const filter: { role?: string; is_active?: boolean } = {};
    if (typeof role === "string" && role.length) filter.role = role;
    if (is_active !== undefined) filter.is_active = is_active === "true";

    const { page, limit, skip } = parsePagination(req);
    const { users, total } = await UserService.listUsersFiltered(filter, limit, skip);
    const safe = users.map((u) => stripUserSecrets(u));

    return sendSuccess(res, 200, "Users retrieved", safe, paginationMeta(total, page, limit));
  } catch (error) {
    console.error("getAllUsers:", error);
    return sendError(res, 400, "Failed to fetch users");
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener usuario por id
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    if (typeof rawId !== "string") {
      return sendError(res, 400, "Invalid user id");
    }
    const { user, client_profile } = await UserService.getUserByIdWithClientProfileIfExists(rawId);
    const safe = stripUserSecrets(user);

    return sendSuccess(res, 200, "User retrieved", { user: safe, client_profile });
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    console.error("getUserById:", error);
    return sendError(res, 400, "Failed to fetch user");
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar usuario (admin)
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    if (typeof rawId !== "string") {
      return sendError(res, 400, "Invalid user id");
    }

    const { user, client_profile } = await UserService.updateUserByAdmin(rawId, req.body);

    const safe = stripUserSecrets(user);
    return sendSuccess(res, 200, "User updated", { user: safe, client_profile });
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    console.error("updateUser:", error);
    return sendError(res, 400, "User update failed");
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Desactivar usuario
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 */
export const deactivateUser = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.id;
    if (typeof rawId !== "string") {
      return sendError(res, 400, "Invalid user id");
    }

    const updated = await UserService.deactivateUser(rawId);
    return sendSuccess(res, 200, "User deactivated", stripUserSecrets(updated));
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    console.error("deactivateUser:", error);
    return sendError(res, 400, "User deactivation failed");
  }
};

import { Request, Response } from "express";
import { PropertyService } from "../services/property.service";
import { sendSuccess, sendError } from "../utils/response";
import { AppError } from "../utils/AppError";

/**
 * @swagger
 * tags:
 *   name: Properties
 *   description: Gestión de sedes (propiedades) de los clientes.
 */

/**
 * @swagger
 * /api/properties/me:
 *   get:
 *     summary: Obtener mis sedes (Cliente)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de sedes del usuario autenticado
 */
export const getMyProperties = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.user!.userId);
    const properties = await PropertyService.listByUserId(userId);
    return sendSuccess(res, 200, "Properties retrieved", properties);
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to fetch properties");
  }
};

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Añadir sede propia (Cliente)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       201:
 *         description: Sede creada
 */
export const addProperty = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.userId; // Optional userId in path
    let userId: number;

    if (!idParam || idParam === "me") {
      userId = Number(req.user!.userId);
    } else {
      if (req.user!.role !== "admin") return sendError(res, 403, "Forbidden");
      userId = Number(idParam);
      if (isNaN(userId)) return sendError(res, 400, "Invalid user id");
    }

    const created = await PropertyService.addPropertyForClientUser(userId, req.body);
    return sendSuccess(res, 201, "Property added", created);
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to add property");
  }
};

/**
 * @swagger
 * /api/properties/user/{userId}:
 *   post:
 *     summary: Añadir sede a un usuario específico (Admin)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       201:
 *         description: Sede creada
 */
// Handled by the same function (addProperty) in the router

/**
 * @swagger
 * /api/properties/user/{userId}:
 *   get:
 *     summary: Obtener sedes de un usuario (Admin)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de sedes del usuario
 */
export const getUserProperties = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return sendError(res, 400, "Invalid user id");
    
    const properties = await PropertyService.listByUserId(userId);
    return sendSuccess(res, 200, "Properties retrieved", properties);
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to fetch properties");
  }
};

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Actualizar sede (Dueño o Admin)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyInput'
 *     responses:
 *       200:
 *         description: Sede actualizada
 */
export const updateProperty = async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.id);
    if (isNaN(propertyId)) return sendError(res, 400, "Invalid property id");

    const userId = req.user!.role === "admin" ? undefined : Number(req.user!.userId);
    
    await PropertyService.updateProperty(propertyId, req.body, userId);
    return sendSuccess(res, 200, "Property updated");
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to update property");
  }
};

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Eliminar sede (Dueño o Admin)
 *     tags: [Properties]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sede eliminada
 */
export const deleteProperty = async (req: Request, res: Response) => {
  try {
    const propertyId = Number(req.params.id);
    if (isNaN(propertyId)) return sendError(res, 400, "Invalid property id");

    const userId = req.user!.role === "admin" ? undefined : Number(req.user!.userId);

    await PropertyService.deleteProperty(propertyId, userId);
    return sendSuccess(res, 200, "Property deleted");
  } catch (error: unknown) {
    if (error instanceof AppError) return sendError(res, error.statusCode, error.message);
    return sendError(res, 400, "Failed to delete property");
  }
};

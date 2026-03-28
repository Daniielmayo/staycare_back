import { Request, Response } from "express";
import { ItemService } from "../services/item.service";
import { sendSuccess, sendError } from "../utils/response";

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Catálogo de ítems y servicios de lavandería
 */

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Crear un nuevo ítem en el catálogo (admin)
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [item_code, name, base_price]
 *             properties:
 *               item_code: { type: string, example: "SHT-S" }
 *               name:      { type: string, example: "Single Sheet" }
 *               base_price: { type: number, example: 5.50 }
 *     responses:
 *       201:
 *         description: Ítem creado
 *       409:
 *         description: El código de ítem ya existe
 */
export const createItem = async (req: Request, res: Response) => {
  try {
    const item = await ItemService.createItem(req.body);
    return sendSuccess(res, 201, "Item created", item);
  } catch (error: any) {
    if (error.message === "Item code already exists") {
      return sendError(res, 409, error.message);
    }
    return sendError(res, 400, "Item creation failed");
  }
};

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Listar todos los ítems del catálogo
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: active
 *         schema: { type: boolean }
 *     responses:
 *       200:
 *         description: Lista de ítems
 */
export const getAllItems = async (req: Request, res: Response) => {
  try {
    const active = req.query.active === undefined ? undefined : req.query.active === "true";
    const items = await ItemService.getAllItems(active);
    return sendSuccess(res, 200, "Items retrieved", items);
  } catch (error) {
    return sendError(res, 400, "Failed to fetch items");
  }
};

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Obtener detalle de un ítem
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalle del ítem
 */
export const getItemById = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id as string;
    const item = await ItemService.getItemById(itemId);
    if (!item) return sendError(res, 404, "Item not found");
    return sendSuccess(res, 200, "Item retrieved", item);
  } catch (error) {
    return sendError(res, 400, "Failed to fetch item");
  }
};

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Actualizar un ítem (admin)
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ítem actualizado
 */
export const updateItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id as string;
    const item = await ItemService.updateItem(itemId, req.body);
    if (!item) return sendError(res, 404, "Item not found");
    return sendSuccess(res, 200, "Item updated", item);
  } catch (error) {
    return sendError(res, 400, "Item update failed");
  }
};

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Eliminar un ítem (admin)
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Ítem eliminado
 */
export const deleteItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.id as string;
    await ItemService.deleteItem(itemId);
    return sendSuccess(res, 200, "Item deleted");
  } catch (error) {
    return sendError(res, 400, "Item deletion failed");
  }
};

/**
 * @swagger
 * /api/items/seed:
 *   post:
 *     summary: Poblado inicial de ítems por defecto (admin)
 *     tags: [Items]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Resultado del seed
 */
export const seedItems = async (_req: Request, res: Response) => {
  try {
    const createdCount = await ItemService.seedItems();
    return sendSuccess(res, 200, `Seeded ${createdCount} items`);
  } catch (error) {
    return sendError(res, 400, "Seed failed");
  }
};

import pool from "../db/pool";
import { RouteRepository } from "../repositories/route.repository";
import { OrderRepository } from "../repositories/order.repository";
import { OrderStatus } from "../types/orderStatus";
import { AppError } from "../utils/AppError";

interface RouteCreateInput {
  route_date: string;
  driver_id: number;
  area: string;
  status?: "planned" | "in_progress" | "completed";
  order_ids?: number[];
}

export class RouteService {
  static async createRoute(data: RouteCreateInput) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const routeId = await RouteRepository.insert(conn, {
        route_date: data.route_date,
        driver_id: data.driver_id,
        area: data.area,
        ...(data.status ? { status: data.status } : {}),
      });

      if (data.order_ids?.length) {
        for (let i = 0; i < data.order_ids.length; i++) {
          const orderId = data.order_ids[i];
          // Update order status to Assigned
          await OrderRepository.update(orderId!, { 
            status: OrderStatus.ASSIGNED, 
            driver_id: data.driver_id 
          });
          // Assign to route_orders
          await RouteRepository.assignOrder(conn, routeId, orderId!, i + 1);
        }
      }

      await conn.commit();
      return await RouteRepository.findById(routeId);
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }

  static async listRoutes(filter: any, limit: number, skip: number) {
    return await RouteRepository.findAll(filter, limit, skip);
  }

  static async getRouteById(id: number | string) {
    const route = await RouteRepository.findById(id);
    if (!route) throw new AppError("Route not found", 404);
    return route;
  }

  static async updateRoute(id: number | string, data: any) {
    await RouteRepository.update(id, data);
    return await RouteRepository.findById(id);
  }

  static async deleteRoute(id: number | string) {
    const route = await RouteRepository.findById(id);
    if (!route) throw new AppError("Route not found", 404);
    if (route.status !== "planned") {
      throw new AppError("Only planned routes can be deleted", 400);
    }
    await RouteRepository.delete(id);
  }
}

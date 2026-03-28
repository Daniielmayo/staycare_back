import type { RowDataPacket } from "mysql2";
import pool from "../db/pool";
import type { UserRole } from "../utils/jwt";

const cache = new Map<string, number>();

export class RoleRepository {
  static async getIdByName(name: UserRole): Promise<number> {
    const hit = cache.get(name);
    if (hit !== undefined) return hit;

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM roles WHERE name = ? LIMIT 1",
      [name]
    );
    const id = (rows[0] as { id: number } | undefined)?.id;
    if (id === undefined) {
      throw new Error(`Role not found in database: ${name}`);
    }
    cache.set(name, id);
    return id;
  }
}

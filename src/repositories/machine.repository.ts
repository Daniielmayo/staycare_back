import pool from "../db/pool";
import type { PoolConnection } from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export type MachineType = "washer" | "dryer" | "iron";
export type MachineStatus = "available" | "running" | "maintenance";

export interface IMachineMySQL {
  id: number;
  name: string;
  type: MachineType;
  capacity: number;           // kg — DECIMAL(6,2) en BD
  status: MachineStatus;
  current_order_id: number | null;
  started_at: Date | null;
  created_at: Date;
  updated_at: Date;
  // Populated via JOIN
  order_number?: string;
  order_status?: string;
}

export class MachineRepository {
  // ─── Read ──────────────────────────────────────────────────────────────────

  static async findAll(): Promise<IMachineMySQL[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*,
              o.order_number,
              o.status AS order_status
       FROM machines m
       LEFT JOIN orders o ON m.current_order_id = o.id
       ORDER BY m.type ASC, m.name ASC`
    );
    return rows as IMachineMySQL[];
  }

  static async findById(id: number | string): Promise<IMachineMySQL | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT m.*,
              o.order_number,
              o.status AS order_status
       FROM machines m
       LEFT JOIN orders o ON m.current_order_id = o.id
       WHERE m.id = ? LIMIT 1`,
      [id]
    );
    return (rows[0] as IMachineMySQL) || null;
  }

  static async countAll(): Promise<number> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM machines`
    );
    return Number((rows[0] as { total: number }).total) || 0;
  }

  // ─── Insert ────────────────────────────────────────────────────────────────

  static async insert(
    conn: PoolConnection,
    data: { name: string; type: MachineType; capacity: number }
  ): Promise<number> {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO machines (name, type, capacity) VALUES (?, ?, ?)`,
      [data.name, data.type, data.capacity]
    );
    return result.insertId;
  }

  static async bulkInsert(
    conn: PoolConnection,
    machines: { name: string; type: MachineType; capacity: number }[]
  ): Promise<void> {
    for (const m of machines) {
      await conn.execute(
        `INSERT IGNORE INTO machines (name, type, capacity) VALUES (?, ?, ?)`,
        [m.name, m.type, m.capacity]
      );
    }
  }

  // ─── Update ────────────────────────────────────────────────────────────────

  static async update(
    id: number | string,
    data: Partial<Pick<IMachineMySQL, "name" | "type" | "capacity" | "status" | "current_order_id" | "started_at">>
  ): Promise<void> {
    const entries = Object.entries(data).filter(([, v]) => v !== undefined);
    if (entries.length === 0) return;

    const setClause = entries.map(([k]) => `${k} = ?`).join(", ");
    const values = entries.map(([, v]) => v);
    values.push(id);

    await pool.execute(`UPDATE machines SET ${setClause} WHERE id = ?`, values);
  }

  static async assign(id: number | string, orderId: number): Promise<void> {
    await pool.execute(
      `UPDATE machines SET status = 'running', current_order_id = ?, started_at = NOW() WHERE id = ?`,
      [orderId, id]
    );
  }

  static async release(id: number | string): Promise<void> {
    await pool.execute(
      `UPDATE machines SET status = 'available', current_order_id = NULL, started_at = NULL WHERE id = ?`,
      [id]
    );
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  static async delete(id: number | string): Promise<void> {
    await pool.execute(`DELETE FROM machines WHERE id = ?`, [id]);
  }
}

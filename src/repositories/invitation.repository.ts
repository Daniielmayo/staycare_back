import pool from "../db/pool";
import type { PoolConnection } from "mysql2/promise";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface IInvitationMySQL {
  id: number;
  token: string;
  email: string;
  role: "admin" | "staff" | "driver";
  created_by: number;
  used: boolean;
  used_at: Date | null;
  expires_at: Date;
  created_at: Date;
  // Populated via JOIN
  creator_name?: string;
  creator_email?: string;
}

export class InvitationRepository {
  static async findByToken(token: string): Promise<IInvitationMySQL | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT i.*, u.name AS creator_name, u.email AS creator_email
       FROM invitations i
       LEFT JOIN users u ON i.created_by = u.id
       WHERE i.token = ? LIMIT 1`,
      [token]
    );
    if (!rows[0]) return null;
    const row = rows[0] as any;
    return { ...row, used: Boolean(row.used) };
  }

  static async findPendingByEmail(email: string): Promise<IInvitationMySQL[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM invitations WHERE email = ? AND used = 0`,
      [email]
    );
    return (rows as any[]).map((r) => ({ ...r, used: Boolean(r.used) }));
  }

  static async insert(
    conn: PoolConnection,
    data: {
      token: string;
      email: string;
      role: "admin" | "staff" | "driver";
      created_by: number;
      expires_at: Date;
    }
  ): Promise<number> {
    const [result] = await conn.execute<ResultSetHeader>(
      `INSERT INTO invitations (token, email, role, created_by, expires_at)
       VALUES (?, ?, ?, ?, ?)`,
      [data.token, data.email, data.role, data.created_by, data.expires_at]
    );
    return result.insertId;
  }

  /** Invalida todas las invitaciones pendientes del mismo email */
  static async invalidatePendingByEmail(
    conn: PoolConnection,
    email: string
  ): Promise<void> {
    await conn.execute(
      `UPDATE invitations SET used = 1, used_at = NOW() WHERE email = ? AND used = 0`,
      [email]
    );
  }

  static async markUsed(
    conn: PoolConnection,
    token: string
  ): Promise<void> {
    await conn.execute(
      `UPDATE invitations SET used = 1, used_at = NOW() WHERE token = ?`,
      [token]
    );
  }

  static async findMany(limit = 50): Promise<IInvitationMySQL[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT i.*, u.name AS creator_name, u.email AS creator_email
       FROM invitations i
       LEFT JOIN users u ON i.created_by = u.id
       ORDER BY i.expires_at DESC
       LIMIT ?`,
      [limit]
    );
    return (rows as any[]).map((r) => ({ ...r, used: Boolean(r.used) }));
  }
}

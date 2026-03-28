import pool from "../db/pool";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export interface IPasswordResetMySQL {
  id?: number;
  email: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at?: Date;
}

export class PasswordResetRepository {
  static async create(data: { email: string; token: string; expires_at: Date }): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO password_resets (email, token, expires_at, used) VALUES (?, ?, ?, 0)",
      [data.email, data.token, data.expires_at]
    );
    return result.insertId;
  }

  static async findActiveByToken(token: string): Promise<IPasswordResetMySQL | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW() LIMIT 1",
      [token]
    );
    return (rows[0] as IPasswordResetMySQL) || null;
  }

  static async markAsUsed(id: number): Promise<void> {
    await pool.execute(
      "UPDATE password_resets SET used = 1 WHERE id = ?",
      [id]
    );
  }
}

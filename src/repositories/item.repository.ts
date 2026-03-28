import pool from "../db/pool";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

export interface IItemRow extends RowDataPacket {
  id: number;
  item_code: string;
  name: string;
  base_price: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface ItemInsertInput {
  item_code: string;
  name: string;
  base_price: number;
}

export class ItemRepository {
  static async findAll(active?: boolean): Promise<IItemRow[]> {
    let query = "SELECT * FROM items";
    const params: any[] = [];

    if (active !== undefined) {
      query += " WHERE active = ?";
      params.push(active ? 1 : 0);
    }

    query += " ORDER BY item_code ASC";

    const [rows] = await pool.execute<IItemRow[]>(query, params);
    return rows;
  }

  static async findById(id: number | string): Promise<IItemRow | null> {
    const [rows] = await pool.execute<IItemRow[]>("SELECT * FROM items WHERE id = ?", [id]);
    return rows[0] || null;
  }

  static async findByCode(code: string): Promise<IItemRow | null> {
    const [rows] = await pool.execute<IItemRow[]>("SELECT * FROM items WHERE item_code = ?", [code]);
    return rows[0] || null;
  }

  static async insert(data: ItemInsertInput): Promise<number> {
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO items (item_code, name, base_price) VALUES (?, ?, ?)",
      [data.item_code, data.name, data.base_price]
    );
    return result.insertId;
  }

  static async update(id: number | string, data: Partial<ItemInsertInput> & { active?: boolean }): Promise<void> {
    const fields = Object.keys(data);
    if (fields.length === 0) return;

    const setClause = fields.map((f) => `${f} = ?`).join(", ");
    const values = [...Object.values(data), id];

    await pool.execute(`UPDATE items SET ${setClause} WHERE id = ?`, values);
  }

  static async delete(id: number | string): Promise<void> {
    await pool.execute("DELETE FROM items WHERE id = ?", [id]);
  }
}

import type { Request, Response, NextFunction } from "express";
import { authenticate } from "./authenticate";
import { authorize } from "./authorize";

/**
 * `POST /api/auth/register`: sin auth si `role` es `client` (o no se envía).
 * `admin`, `staff` y `driver` exigen sesión de un usuario **admin**.
 */
const REGISTER_ROLES = ["client", "admin", "staff", "driver"] as const;

export const registerAuthGate = (req: Request, res: Response, next: NextFunction) => {
  const role = req.body?.role ?? "client";
  if (!(REGISTER_ROLES as readonly string[]).includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }
  if (role === "client") {
    return next();
  }
  authenticate(req, res, () => {
    authorize("admin")(req, res, next);
  });
};

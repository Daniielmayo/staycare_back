import crypto from "crypto";

export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

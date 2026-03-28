import { Router } from "express";
import { validate } from "../middleware/validate";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";
import {
  createInvitationSchema,
  registerViaInviteSchema,
} from "../validation/invitation.validation";
import {
  createInvitation,
  validateInvitation,
  registerViaInvitation,
  listInvitations,
} from "../controllers/invitation.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invitations
 *   description: Invitaciones de alta de personal — admin, staff, driver
 */

// ─── Admin-protected ──────────────────────────────────────────────────────────

router.post(
  "/",
  authenticate,
  authorize("admin"),
  validate(createInvitationSchema),
  createInvitation,
);

router.get("/", authenticate, authorize("admin"), listInvitations);

// ─── Public (no auth required) ────────────────────────────────────────────────

router.get("/:token/validate", validateInvitation);

router.post(
  "/:token/register",
  validate(registerViaInviteSchema),
  registerViaInvitation,
);

export default router;

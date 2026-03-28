import { Router } from "express";
import { validate } from "../middleware/validate";
import { registerAuthGate } from "../middleware/registerAuthGate";
import {
  loginUserSchema,
  registerUserSchema,
  changePasswordSchema,
  updateMeSchema,
} from "../validation/user.validation";
import { authenticate } from "../middleware/authenticate";
import {
  register,
  login,
  refreshAccessToken,
  logout,
  getMe,
  updateMe,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from "../controllers/auth.controller";

const router = Router();

// Public / Auth gates
router.post("/register", validate(registerUserSchema), registerAuthGate, register);
router.post("/login", validate(loginUserSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password/:token", resetPassword);

// Private / Self management
router.use(authenticate);

router.get("/me", getMe);
router.patch("/me", validate(updateMeSchema), updateMe);
router.patch("/password", validate(changePasswordSchema), changePassword);

export default router;

import { Router } from "express";
import {
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../controllers/client.controller";
import { validate } from "../middleware/validate";
import { updateClientSchema } from "../validation/client.validation";
import { authenticate } from "../middleware/authenticate";
import { authorize } from "../middleware/authorize";

const router = Router();

router.use(authenticate);

router.get("/", authorize("admin", "staff"), getAllClients);
router.get("/:id", authorize("admin", "staff", "client"), getClientById);
router.put(
  "/:id",
  authorize("admin", "staff"),
  validate(updateClientSchema),
  updateClient,
);
router.delete("/:id", authorize("admin"), deleteClient);

export default router;

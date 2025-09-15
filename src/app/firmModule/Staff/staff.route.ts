import { Router } from "express";
import { staffController } from "./staff.controller";

const router = Router();

// GET staff list
router.get("/:firmId/list", staffController.listStaff);

// PUT update staff
router.put("/:firmId/:staffId/update", staffController.updateStaff);

// DELETE staff
router.delete("/:firmId/:staffId/delete", staffController.deleteStaff);

export const staffRoutes = router;

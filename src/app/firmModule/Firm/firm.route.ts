import { Router } from "express";
import { firmController } from "./firm.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";


const router = Router();

// Admin Firm Management Endpoints
router.post("/firms", firmAuth(Firm_USER_ROLE.ADMIN), firmController.createFirm);
router.get("/firms", firmAuth(Firm_USER_ROLE.ADMIN), firmController.listFirms);
router.get("/firms/:id", firmController.getFirmById);
router.put("/firms/:id", firmAuth(Firm_USER_ROLE.ADMIN), firmController.updateFirm);
router.delete("/firms/:id", firmAuth(Firm_USER_ROLE.ADMIN), firmController.deleteFirm);

export const firmRouter= router;

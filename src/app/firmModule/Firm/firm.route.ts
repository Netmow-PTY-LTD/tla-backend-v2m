import { Router } from "express";
import { firmController } from "./firm.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";


const router = Router();

router.get("/firmInfo", firmAuth(Firm_USER_ROLE.FIRM), firmController.getFirmInfo);

router.put("/firmInfo/update", firmAuth(Firm_USER_ROLE.FIRM), firmController.updateFirmInfo);


// Admin  Firm Management Endpoints 
router.post("/", firmAuth(Firm_USER_ROLE.ADMIN), firmController.createFirm);
router.get("/", firmAuth(Firm_USER_ROLE.ADMIN), firmController.listFirms);
router.get("/:id", firmController.getFirmById);
router.put("/:id", firmAuth(Firm_USER_ROLE.ADMIN), firmController.updateFirm);
router.delete("/firms/:id", firmAuth(Firm_USER_ROLE.ADMIN), firmController.deleteFirm);


export const firmRouter= router;

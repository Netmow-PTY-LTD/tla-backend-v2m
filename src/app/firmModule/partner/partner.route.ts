import { Router } from "express";
import { partnerController } from "./partner.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";

const router = Router();

// All routes require firm role
router.use(firmAuth(Firm_USER_ROLE.FIRM)); 

router.post("/add", partnerController.createPartner);
router.get("/list", partnerController.listPartners);
router.put("/:partnerId/update", partnerController.updatePartner);
router.delete("/:partnerId/delete", partnerController.deletePartner);

export  const partnerRouter= router;

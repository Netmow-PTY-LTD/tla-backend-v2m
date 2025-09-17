import { Router } from "express";
import { partnerController } from "./partner.controller";

const router = Router();

router.post("/add", partnerController.createPartner);
router.get("/:firmId/list", partnerController.listPartners);
router.put("/:firmId/:partnerId/update", partnerController.updatePartner);
router.delete("/:firmId/:partnerId/delete", partnerController.deletePartner);

export  const partnerRouter= router;

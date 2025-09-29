import { NextFunction, Request, Response, Router } from "express";
import { partnerController } from "./partner.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";
import { upload } from "../../config/upload";

const router = Router();

// All routes require firm role
router.use(firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF));

router.post("/add",
    upload.single('partnerImage'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },

    partnerController.createPartner);
router.get("/list", partnerController.listPartners);
router.put("/:partnerId/update",
    upload.single('partnerImage'),
    (req: Request, res: Response, next: NextFunction) => {
        req.body = JSON.parse(req.body.data);
        next();
    },

    partnerController.updatePartner);
router.delete("/:partnerId/delete", partnerController.deletePartner);
router.delete("/:partnerId", partnerController.deletePartner);
router.get("/:partnerId", partnerController.getSinglePartner);

export const partnerRouter = router;

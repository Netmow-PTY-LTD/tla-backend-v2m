import { NextFunction, Request, Response, Router } from "express";

import { claimController } from "./claim.controller";
import { upload } from "../../config/upload";

const router = Router();

router.post("/", upload.array("proofOwnFiles"), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, claimController.createClaimRequest);
router.get("/list", claimController.listClaims);
router.put("/:claimId/status", claimController.updateClaimStatus);






export const claimRouter = router;
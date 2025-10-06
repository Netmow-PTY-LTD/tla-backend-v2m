import { NextFunction, Request, Response, Router } from "express";

import { claimController } from "./claim.controller";
import { upload } from "../../config/upload";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";

const router = Router();

router.post("/", upload.array("proofOwnFiles"), (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
}, claimController.createClaimRequest);
router.get("/list", auth(USER_ROLE.ADMIN), claimController.listClaims);
router.put("/:claimId/status", auth(USER_ROLE.ADMIN), claimController.updateClaimStatus);






export const claimRouter = router;




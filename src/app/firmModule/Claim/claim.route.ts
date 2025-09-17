import { Router } from "express";

import { claimController } from "./claim.controller";

const router = Router();

router.post("/", claimController.createClaimRequest);
router.get("/list", claimController.listClaims);
router.put("/:claimId/status", claimController.updateClaimStatus);






export const claimRouter=router;
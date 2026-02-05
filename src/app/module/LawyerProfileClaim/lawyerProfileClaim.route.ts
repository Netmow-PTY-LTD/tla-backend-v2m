import express from "express";
import { USER_ROLE } from "../../constant";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { LawyerProfileClaimController } from "./lawyerProfileClaim.controller";
import { LawyerProfileClaimValidation } from "./lawyerProfileClaim.validation";

const router = express.Router();

router.post(
    "/",
    validateRequest(LawyerProfileClaimValidation.createLawyerProfileClaimZodSchema),
    LawyerProfileClaimController.createLawyerProfileClaim
);

router.get(
    "/",
    auth(USER_ROLE.ADMIN),
    LawyerProfileClaimController.getAllLawyerProfileClaims
);

router.get(
    "/:id",
    auth(USER_ROLE.ADMIN),
    LawyerProfileClaimController.getSingleLawyerProfileClaim
);

router.patch(
    "/:id",
    auth(USER_ROLE.ADMIN),
    validateRequest(LawyerProfileClaimValidation.updateLawyerProfileClaimZodSchema),
    LawyerProfileClaimController.updateLawyerProfileClaim
);

export const LawyerProfileClaimRoutes = router;

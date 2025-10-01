
import { Router } from "express";

import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";
import { eliteProSubscriptionController } from "./EliteProSubs.controller";


const router = Router();
// Routes
router.post("/add", auth(USER_ROLE.ADMIN), eliteProSubscriptionController.createEliteProSubscription);
router.get("/list", eliteProSubscriptionController.getEliteProSubscriptions);
router.get("/:id", eliteProSubscriptionController.getEliteProSubscriptionById);
router.patch("/:id/update", auth(USER_ROLE.ADMIN), eliteProSubscriptionController.updateEliteProSubscription);
router.delete("/:id/delete", auth(USER_ROLE.ADMIN), eliteProSubscriptionController.deleteEliteProSubscription);




export const eliteProSubscriptionRouter = router;

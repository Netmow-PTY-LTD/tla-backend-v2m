
import { Router } from "express";

import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";
import { subscriptionController } from "./subscription.controller";


const router = Router();

router.post("/add", auth(USER_ROLE.ADMIN), subscriptionController.createSubscription);
router.get("/list", subscriptionController.getSubscriptions);
router.get("/:id", subscriptionController.getSubscriptionById);
router.patch("/:id/update", auth(USER_ROLE.ADMIN), subscriptionController.updateSubscription);
router.delete("/:id/delete", auth(USER_ROLE.ADMIN), subscriptionController.deleteSubscription);

export const subscriptionRoutes =   router;

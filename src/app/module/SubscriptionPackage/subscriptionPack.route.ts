
import { Router } from "express";

import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";
import {  subscriptionPackageController } from "./subscriptionPack.controller";


const router = Router();

router.post("/add", auth(USER_ROLE.ADMIN), subscriptionPackageController.createSubscription);
router.get("/list", subscriptionPackageController.getSubscriptions);
router.get("/:id", subscriptionPackageController.getSubscriptionById);
router.patch("/:id/update", auth(USER_ROLE.ADMIN), subscriptionPackageController.updateSubscription);
router.delete("/:id/delete", auth(USER_ROLE.ADMIN), subscriptionPackageController.deleteSubscription);

export const subscriptionPackRoutes =   router;

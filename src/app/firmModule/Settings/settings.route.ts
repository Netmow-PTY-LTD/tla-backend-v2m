
import express from "express";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";
import { FirmUserController } from "./settings.controller";


const router = express.Router();

router.patch(
  "/permissions",
  firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF),
  FirmUserController.updateUserPermissions
);

export const firmSettingsRouter = router;

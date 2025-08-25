
import { Router } from "express";
import auth from "../../../middlewares/auth";
import { USER_ROLE } from "../../../constant";
import { profileVisitorController } from "../controllers/profileVisitor.controller";

const router = Router();

router.post(
  "/visit",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  profileVisitorController.trackProfileVisit
);

router.get(
  "/recent",
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  profileVisitorController.getProfileRecentVisitors
);

export const profileVisitorRouter = router;

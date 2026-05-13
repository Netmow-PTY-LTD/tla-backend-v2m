import express from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";
import { websiteFaqController } from "./websiteFaq.controller";

const router = express.Router();

// Public routes - no authentication required
router.get("/public", websiteFaqController.getPublicFaqs);
router.get("/public/:id", websiteFaqController.getWebsiteFaqById);

// Company website public routes - no authentication required
router.get("/company/public", websiteFaqController.getCompanyPublicFaqs);

// Admin routes - require SUPER_ADMIN, ADMIN, or MARKETER role
router.get(
  "/list",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER ,USER_ROLE.USER),
  websiteFaqController.getAllFaqs
);

router.post(
  "/add",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER,USER_ROLE.USER),
  websiteFaqController.createWebsiteFaq
);

router.get(
  "/:id",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER,USER_ROLE.USER),
  websiteFaqController.getWebsiteFaqById
);

router.patch(
  "/:id/update",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER,USER_ROLE.USER),
  websiteFaqController.updateWebsiteFaq
);

router.delete(
  "/:id/delete",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER,USER_ROLE.USER),
  websiteFaqController.deleteWebsiteFaq
);

router.post(
  "/bulk-order",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER,USER_ROLE.USER),
  websiteFaqController.bulkUpdateOrder
);

router.patch(
  "/:id/toggle",
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MARKETER,USER_ROLE.USER),
  websiteFaqController.toggleActiveStatus
);

export const websiteFaqRoutes = router;

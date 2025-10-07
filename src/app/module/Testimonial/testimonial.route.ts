import express from "express";
import auth from "../../middlewares/auth";
import { upload } from "../../config/upload";
import { testimonialController } from "./testimonial.controller";
import { USER_ROLE } from "../../constant";


const router = express.Router();

router.get("/list", testimonialController.getTestimonials);
router.get("/:id", testimonialController.getTestimonialById);

router.post(
  "/add",
  auth(USER_ROLE.ADMIN), // restrict to admin if needed
  upload.single("image"),
  testimonialController.createTestimonial
);

router.patch(
  "/:id/update",
  auth(USER_ROLE.ADMIN),
  upload.single("image"),
  testimonialController.updateTestimonial
);

router.delete("/:id/delete", auth(USER_ROLE.ADMIN), testimonialController.deleteTestimonial);

export const testimonialRoutes = router;

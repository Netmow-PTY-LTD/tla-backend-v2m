import { NextFunction, Request, Response, Router } from "express";
import { lawFirmCertController } from "./lawFirmCert.controller";
import { upload } from "../../config/upload";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";

const router = Router();

// Add Law Firm Certification
router.post(
  '/add',
  auth(USER_ROLE.ADMIN),
  upload.single('logo'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },


  lawFirmCertController.createLawFirmCertification
);

// Get all Law Firm Certifications
router.get(
  '/list',
  lawFirmCertController.getLawFirmCertifications
);

// Get single Law Firm Certification by ID
router.get(
  '/:id',
  lawFirmCertController.getLawFirmCertificationById
);

// Update Law Firm Certification by ID
router.put(
  '/:id/update',
  auth(USER_ROLE.ADMIN),
  upload.single('logo'),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  lawFirmCertController.updateLawFirmCertification
);

// Delete Law Firm Certification by ID
router.delete(
  '/:id/delete',
    auth(USER_ROLE.ADMIN),
  lawFirmCertController.deleteLawFirmCertification
);

export const lawFirmCertRouter = router;

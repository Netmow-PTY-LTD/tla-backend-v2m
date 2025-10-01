import { Router } from "express";
import { lawFirmCertController } from "./lawFirmCert.controller";

const router = Router();

// Add Law Firm Certification
router.post(
  '/add',
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
  lawFirmCertController.updateLawFirmCertification
);

// Delete Law Firm Certification by ID
router.delete(
  '/:id/delete',
  lawFirmCertController.deleteLawFirmCertification
);

export const lawFirmCertRouter = router;

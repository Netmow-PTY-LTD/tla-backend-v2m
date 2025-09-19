import { Router } from "express";
import { firmLicenseController } from "./cirtificateLicese.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";


const router = Router();

// All routes require firm role
router.use(firmAuth(Firm_USER_ROLE.FIRM)); 

router.post("/", firmLicenseController.createFirmLicense); // create license
router.get("/", firmLicenseController.getFirmLicenses); // get all firm licenses
router.get("/:licenseId", firmLicenseController.getFirmLicense); // get license by licenseId
router.put("/:licenseId", firmLicenseController.updateFirmLicense); // update license by licenseId
router.delete("/:licenseId", firmLicenseController.deleteFirmLicense); // delete license by id

export  const firmLicenseRoute= router;

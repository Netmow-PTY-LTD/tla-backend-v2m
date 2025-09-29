import { Router } from "express";
import { firmLicenseController } from "./cirtificateLicese.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";


const router = Router();

// All routes require firm role
router.use(firmAuth(Firm_USER_ROLE.ADMIN)); 

router.post("/add", firmLicenseController.createFirmLicense); // create license
router.get("/list", firmLicenseController.getFirmLicenses); // get all firm licenses
router.get("/:licenseId", firmLicenseController.getFirmLicense); // get license by licenseId
router.put("/:licenseId/update", firmLicenseController.updateFirmLicense); // update license by licenseId
router.delete("/:licenseId/delete", firmLicenseController.deleteFirmLicense); // delete license by id

export  const firmLicenseRoute= router;

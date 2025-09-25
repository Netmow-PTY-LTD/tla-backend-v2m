import { Router } from "express";
import { firmLocationController } from "./firmLocation.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";



const router = Router();


router.post("/add", firmAuth(Firm_USER_ROLE.FIRM), firmLocationController.createLocation);
router.get("/list", firmAuth(Firm_USER_ROLE.FIRM), firmLocationController.listLocations);
router.get("/:locationId", firmAuth(Firm_USER_ROLE.FIRM), firmLocationController.getSingleLocation);
router.put("/:locationId/update", firmAuth(Firm_USER_ROLE.FIRM), firmLocationController.updateLocation);
router.delete("/:locationId/delete", firmAuth(Firm_USER_ROLE.FIRM), firmLocationController.deleteLocation);

export const firmLocationRouter= router;

import { Router } from "express";
import { firmLocationController } from "./firmLocation.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";



const router = Router();


router.post("/add", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), firmLocationController.createLocation);
router.get("/list", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), firmLocationController.listLocations);
router.get("/:locationId", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), firmLocationController.getSingleLocation);
router.put("/:locationId/update", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), firmLocationController.updateLocation);
router.delete("/:locationId/delete", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), firmLocationController.deleteLocation);

export const firmLocationRouter= router;

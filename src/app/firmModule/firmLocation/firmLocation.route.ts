import { Router } from "express";
import { firmLocationController } from "./firmLocation.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";



const router = Router();


router.post("/add", firmAuth(Firm_USER_ROLE.ADMIN), firmLocationController.createLocation);
router.get("/list", firmAuth(Firm_USER_ROLE.ADMIN), firmLocationController.listLocations);
router.get("/:locationId", firmAuth(Firm_USER_ROLE.ADMIN), firmLocationController.getSingleLocation);
router.put("/:locationId/update", firmAuth(Firm_USER_ROLE.ADMIN), firmLocationController.updateLocation);
router.delete("/:locationId/delete", firmAuth(Firm_USER_ROLE.ADMIN), firmLocationController.deleteLocation);

export const firmLocationRouter= router;

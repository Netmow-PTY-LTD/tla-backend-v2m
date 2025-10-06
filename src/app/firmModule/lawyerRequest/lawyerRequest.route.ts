import { Router } from "express";
import { lawyerRequestAsMemberController } from "./lawyerRequest.controller";
import firmAuth from "../middleware/firmAuth";
import { Firm_USER_ROLE } from "../FirmAuth/frimAuth.constant";

const router = Router();

router.post("/add", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), lawyerRequestAsMemberController.createLawyerRequest);
router.get("/list", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), lawyerRequestAsMemberController.listLawyerRequests);
router.get("/:id", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), lawyerRequestAsMemberController.getLawyerRequestById);
router.put("/:id/update", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), lawyerRequestAsMemberController.updateLawyerRequest);
router.delete("/:id/delete", firmAuth(Firm_USER_ROLE.ADMIN, Firm_USER_ROLE.STAFF), lawyerRequestAsMemberController.deleteLawyerRequest);

export const lawyerRequestAsMemberRouter = router;

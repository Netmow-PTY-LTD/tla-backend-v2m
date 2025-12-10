import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";
import { dataEntryController } from "./dataEntry.controller";

const router = Router();


router.post(
  "/create-lawyer",
  auth(USER_ROLE.ADMIN),           
  dataEntryController.lawyerRegister
);



export const dataEntryRouter = router;

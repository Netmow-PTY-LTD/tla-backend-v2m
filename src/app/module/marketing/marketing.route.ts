import { Router } from "express";
import auth from "../../middlewares/auth";
import { USER_ROLE } from "../../constant";
import { marketingController } from "./marketing.controller";



const router = Router();


router.post(
  "/create-lawyer",
  auth(USER_ROLE.ADMIN,USER_ROLE.USER),           
  marketingController.lawyerRegister
);



export const marketingRouter = router;

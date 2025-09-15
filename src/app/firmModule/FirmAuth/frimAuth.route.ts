import { Router } from "express";
import { firmAuthController } from "./frimAuth.controller";



const router = Router();


router.post('/register/firm', firmAuthController.firmRegister)
router.post('/register/staff', firmAuthController.staffRegister)



export const firmAuthRouter = router;
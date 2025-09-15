import { Router } from "express";
import { firmAuthRouter } from "../firmModule/FirmAuth/frimAuth.route";
import { claimRouter } from "../firmModule/Claim/claim.route";
import { staffRoutes } from "../firmModule/Staff/staff.route";


const firmRouter = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: firmAuthRouter,
  },
  {
    path: '/claims',
    route: claimRouter,
  },
  {
    path: '/staffs',
    route: staffRoutes,
  },
 

];

moduleRoutes.forEach((route) => firmRouter.use(route.path, route.route));

export default firmRouter;

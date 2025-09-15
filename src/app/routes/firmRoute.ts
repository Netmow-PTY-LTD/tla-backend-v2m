import { Router } from "express";
import { firmAuthRouter } from "../firmModule/FirmAuth/frimAuth.route";
import { claimRouter } from "../firmModule/Claim/claim.route";


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
 

];

moduleRoutes.forEach((route) => firmRouter.use(route.path, route.route));

export default firmRouter;

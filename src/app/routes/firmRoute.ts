import { Router } from "express";
import { firmAuthRouter } from "../firmModule/FirmAuth/frimAuth.route";


const firmRouter = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: firmAuthRouter,
  },
 

];

moduleRoutes.forEach((route) => firmRouter.use(route.path, route.route));

export default firmRouter;

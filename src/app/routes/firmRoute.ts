import { Router } from "express";
import { firmAuthRouter } from "../firmModule/FirmAuth/frimAuth.route";
import { claimRouter } from "../firmModule/Claim/claim.route";
import { staffRoutes } from "../firmModule/Staff/staff.route";
import { partnerRouter } from "../firmModule/partner/partner.route";
import { firmRouter } from "../firmModule/Firm/firm.route";


const firmRoute = Router();

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
  {
    path: '/partner',
    route: partnerRouter,
  },
  {
    path: '/firms',
    route: firmRouter,
  },
 

];

moduleRoutes.forEach((route) => firmRoute.use(route.path, route.route));

export default firmRoute;

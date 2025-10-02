import { Router } from "express";
import { firmAuthRouter } from "../firmModule/FirmAuth/frimAuth.route";
import { claimRouter } from "../firmModule/Claim/claim.route";
import { staffRoutes } from "../firmModule/Staff/staff.route";
import { partnerRouter } from "../firmModule/partner/partner.route";
import { firmRouter } from "../firmModule/Firm/firm.route";
import { firmLicenseRoute } from "../firmModule/FirmWiseCertLicense/cirtificateLicese.route";
import { FirmMediaRoutes } from "../firmModule/media/media.route";
import { firmLocationRouter } from "../firmModule/firmLocation/firmLocation.route";
import { firmViewRouter } from "../firmModule/View/view.router";


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
  {
    path: '/licenseAndCertificate',
    route: firmLicenseRoute,
  },
  {
    path: '/firm-media',
    route: FirmMediaRoutes,
  },
 
  {
    path: '/firmLocation',
    route: firmLocationRouter,
  },
  {
      path: '/',
      route: firmViewRouter,
    },
 

];

moduleRoutes.forEach((route) => firmRoute.use(route.path, route.route));

export default firmRoute;

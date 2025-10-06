import { Router } from "express";
import { firmAuthRouter } from "../firmModule/FirmAuth/frimAuth.route";
import { staffRoutes } from "../firmModule/Staff/staff.route";
import { partnerRouter } from "../firmModule/partner/partner.route";
import { firmRouter } from "../firmModule/Firm/firm.route";
import { firmLicenseRoute } from "../firmModule/FirmWiseCertLicense/cirtificateLicese.route";
import { FirmMediaRoutes } from "../firmModule/media/media.route";
import { firmLocationRouter } from "../firmModule/firmLocation/firmLocation.route";
import { firmViewRouter } from "../firmModule/View/view.router";
import { adminRoutes } from "../firmModule/Admin/admin.route";
import { firmSettingsRouter } from "../firmModule/Settings/settings.route";
import { lawyerRequestAsMemberRouter } from "../firmModule/lawyerRequest/lawyerRequest.route";


const firmRoute = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: firmAuthRouter,
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
    path: '/admin',
    route: adminRoutes,
  },
  {
    path: '/settings',
    route: firmSettingsRouter,
  },
  {
      path: '/',
      route: firmViewRouter,
    },
  {
    path: '/lawyer-request',
    route: lawyerRequestAsMemberRouter,
  }

];

moduleRoutes.forEach((route) => firmRoute.use(route.path, route.route));

export default firmRoute;

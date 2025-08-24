import { Router } from 'express';

import { authRouter } from '../module/Auth/routes/auth.route';
import { UserProfileRouter } from '../module/User/routes/user.route';
import { countryRouter } from '../module/Country/routes/country.route';
import { serviceRouter } from '../module/Service/routes/service.route';
import { OptionRouter } from '../module/Option/routes/option.route';
import { CountryWiseMapRouter } from '../module/CountryWiseMap/routes/countryWiseMap.route';
import { questionRouter } from '../module/Question/routes/ServiceWiseQuestion.route';
import { viewRouter } from '../module/View/routes/view.router';
import { leadServiceRouter } from '../module/LeadSettings/routes/leadService.routes';
import { notificationRouter } from '../module/Notification/routes/notification.routes';
import { creditPaymentRouter } from '../module/CreditPayment/routes/creditPayment.routes';
import { leadRouter } from '../module/Lead/routes/lead.route';
import { responseRouter } from '../module/LeadResponse/routes/response.route';
import { activityLogRouter } from '../module/Activity/routes/logActivity.route';
import { contactRouter } from '../module/Contact/routes/contact.route';
import { settingsRouter } from '../module/Settings/routes/settings.route';
import { categoryRouter } from '../module/Category/routes/category.route';
import { ratingRouter } from '../module/Rating/routes/rating.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: authRouter,
  },
  {
    path: '/user',
    route: UserProfileRouter,
  },
  {
    path: '/country',
    route: countryRouter,
  },
  {
    path: '/service',
    route: serviceRouter,
  },
  {
    path: '/category',
    route: categoryRouter,
  },
  {
    path: '/country-wise-map',
    route: CountryWiseMapRouter,
  },
  {
    path: '/question',
    route: questionRouter,
  },

  {
    path: '/option',
    route: OptionRouter,
  },
  {
    path: '/admin/settings',
    route: settingsRouter,
  },
  {
    path: '/settings/lead-service',
    route: leadServiceRouter,
  },
  {
    path: '/settings/notification',
    route: notificationRouter,
  },
  {
    path: '/settings/credit-payment',
    route: creditPaymentRouter,
  },
  {
    path: '/lead',
    route: leadRouter,
  },
  {
    path: '/response',
    route: responseRouter,
  },
  {
    path: '/contact',
    route: contactRouter,
  },
  {
    path: '/activity-log',
    route: activityLogRouter,
  },
  // {
  //   path: '/rating',
  //   route: ratingRouter,
  // },
  {
    path: '/',
    route: viewRouter,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

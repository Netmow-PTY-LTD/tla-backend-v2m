import { Router } from 'express';
import { authRouter } from '../module/Auth/auth.route';
import { UserProfileRouter } from '../module/User/user.route';
import { countryRouter } from '../module/Country/country.route';
import { serviceRouter } from '../module/Service/service.route';
import { OptionRouter } from '../module/Option/option.route';
import { questionRouter } from '../module/Question/question.route';
import { viewRouter } from '../module/View/view.router';
import { leadServiceRouter } from '../module/LeadSettings/leadService.routes';
import { notificationRouter } from '../module/Notification/notification.routes';
import { creditPaymentRouter } from '../module/CreditPayment/creditPayment.routes';
import { leadRouter } from '../module/Lead/lead.route';
import { responseRouter } from '../module/LeadResponse/response.route';
import { activityLogRouter } from '../module/Activity/logActivity.route';
import { contactRouter } from '../module/Contact/contact.route';
import { settingsRouter } from '../module/Settings/settings.route';
import { categoryRouter } from '../module/Category/category.route';
import { ratingRouter } from '../module/Rating/rating.routes';
import { profileVisitorRouter } from '../module/VisitorTracker/profileVisitor.routes';
import { adminRouter } from '../module/Admin/admin.routes';
import { CountryWiseMapRouter } from '../module/CountryWiseMap/countryWiseMap.route';
import { lawFirmCertRouter } from '../module/LawfirmCertification/lawFirmCert.route';
import { subscriptionPackRoutes} from '../module/SubscriptionPackage/subscriptionPack.route';
import { eliteProSubscriptionRouter } from '../module/EliteProPackage/EliteProSubs.route';
import { pageRouter } from '../module/Pages/page.route';
import { claimRouter } from '../module/Claim/claim.route';
import { testimonialRoutes } from '../module/Testimonial/testimonial.route';
import { userLocationServiceMapRouter } from '../module/UserLocationServiceMap/userLocationServiceMap.route';
import { adminFirmRouter } from '../module/FirmManagement/firm.route';
import { seoRouter } from '../module/Seo/seo.route';
import { blogRouter } from '../module/blog/blog.route';
import { blogCategoryRoutes } from '../module/blogCategory/blogCategory.route';
import { galleryRouter } from '../module/Gallery/gallery.route';

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
    path: '/admin',
    route: adminRouter,
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
  {
    path: '/rating',
    route: ratingRouter,
  },
  {
    path: '/visitor-tracker',
    route: profileVisitorRouter,
  },
  {
    path: '/lawfirm-certification',
    route: lawFirmCertRouter,
  },
  {
    path: '/subscriptions-packages',
    route: subscriptionPackRoutes,
  },
  {
    path: '/elite-pro-package',
    route: eliteProSubscriptionRouter,
  },
  {
    path: '/pages',
    route: pageRouter,
  },
  {
    path: '/claims',
    route: claimRouter,
  },
  {
    path: '/testimonials',
    route: testimonialRoutes,
  },
  {
    path: '/user-location-service-map',
    route: userLocationServiceMapRouter,
  },
  {
    path: '/firms',
    route: adminFirmRouter,
  },
  {
    path: '/seo',
    route: seoRouter,
  },
  {
    path: '/blog',
    route: blogRouter,
  },
  {
    path: '/gallery',
    route: galleryRouter,
  },
  {
    path: '/blog-category',
    route: blogCategoryRoutes,
  },
  {
    path: '/',
    route: viewRouter,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;

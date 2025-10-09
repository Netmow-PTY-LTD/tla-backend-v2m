import { Router } from 'express';
import { viewController } from './view.controller';
import { commonController } from './common.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';

const router = Router();

router.get(
  '/service-wise-questions',
  viewController.getSingleServiceWiseQuestion,
);
router.get('/question-wise-options', viewController.getQuestionWiseOptions);

router.get('/public/user/list', viewController.getAllUserProfile);
router.get(
  '/public/user/by-id/:userId',
  viewController.getSingleUserProfileById,
);
router.get(
  '/public/user/by-slug/:slug',
  viewController.getSingleUserProfileBySlug,
);

router.post(
  '/contact-lawyer',
  auth(USER_ROLE.ADMIN,USER_ROLE.USER),
  commonController.contactLawyer,
);
router.get(
  '/chat/:responseId',
  auth(USER_ROLE.ADMIN,USER_ROLE.USER),
  commonController.getChatHistory,
);

router.get(
   '/lawyer-suggestions',
  auth(USER_ROLE.ADMIN,USER_ROLE.USER),
  commonController.getLawyerSuggestions,
);



// Create a new contact request
router.post('/lead-request', auth(USER_ROLE.ADMIN,USER_ROLE.USER), commonController.createLeadContactRequest);

// Get requests received by the logged-in user
router.get('/lead-requests', auth(USER_ROLE.ADMIN,USER_ROLE.USER), commonController.getLeadContactRequests);
router.get('/lead-request/:leadRequestId', auth(USER_ROLE.ADMIN,USER_ROLE.USER), commonController.getSingleLeadContactRequests);
// Update status (accept/reject)
router.patch('/lead-request/:leadRquestId/status', auth(USER_ROLE.ADMIN,USER_ROLE.USER), commonController.updateLeadContactRequestStatus);


router.get(
   '/country-wise-service-wise-lead',
  commonController.countryWiseServiceWiseLead,
);





//   company public api

router.get('/public/firm/list', viewController.getAllCompanyProfilesList);




//   lawyer cancel membership request
router.post('/lawyer/cancel-membership-request', auth(USER_ROLE.USER), commonController.lawyerCancelMembershipRequest);



export const viewRouter = router;

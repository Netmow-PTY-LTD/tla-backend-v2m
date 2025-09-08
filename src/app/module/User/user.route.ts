import { Router } from 'express';
import { userProfileController } from './user.controller';
// import { authZodValidation } from '../validations/user.validation';
// import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { upload } from '../../config/upload';
import { customServiceController } from './customService.controller';
import { accreditationController } from './accrediation.controller';
import { faqController } from './faq.controller';
import { profileMediaController } from './profileMedia.controller';
const router = Router();

router.get(
  '/userInfo',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  userProfileController.getUserProfileInfo,
);
router.get(
  '/list',
  auth(USER_ROLE.ADMIN),
  userProfileController.getAllUserProfile,
);

router.delete(
  '/delete/:userId',
  auth(USER_ROLE.ADMIN),
  userProfileController.deleteSingleUserProfile,
);
router.patch(
  '/update',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  // upload.single('file'),
  upload.any(),
  // (req: Request, res: Response, next: NextFunction) => {
  //   req.body = JSON.parse(req.body.data);
  //   next();
  // },
  // validateRequest(authZodValidation.userUpdateZodValidationSchema),
  userProfileController.updateProfile,
);
router.get('/:userId', userProfileController.getSingleUserProfileData);
router.delete(
  '/service/delete/:customServiceId',

  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  customServiceController.deleteCustomService,
);
router.delete(
  '/accreditation/delete/:accreditationId',

  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  accreditationController.deleteProfileAccreditation,
);
router.delete(
  '/faq/delete/:faqId',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  faqController.deleteFaq,
);


router.patch(
  '/profile-media/remove',
  auth(USER_ROLE.ADMIN, USER_ROLE.USER),
  profileMediaController.removeProfileMedia
);


router.patch(
  '/update/default/:userId',
  auth(USER_ROLE.ADMIN),
  upload.single('file'), // single file
 userProfileController.updateDefaultProfile
);

export const UserProfileRouter = router;

import { Router } from 'express';
import { userProfileController } from '../controllers/user.controller';
// import { authZodValidation } from '../validations/user.validation';
// import validateRequest from '../../../middlewares/validateRequest';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { upload } from '../../../config/upload';
import { customServiceController } from '../controllers/customService.controller';
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
router.delete('/:customServiceId', customServiceController.deleteCustomService);

export const UserProfileRouter = router;

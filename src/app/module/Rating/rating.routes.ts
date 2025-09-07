import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { ratingController } from './rating.controller';

const router = Router();



router.post( '/',auth(USER_ROLE.ADMIN, USER_ROLE.USER),  ratingController.createRating);



export const ratingRouter = router;

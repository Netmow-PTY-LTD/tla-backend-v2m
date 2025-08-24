import { Router } from 'express';
import auth from '../../../middlewares/auth';
import { USER_ROLE } from '../../../constant';
import { ratingController } from '../controllers/rating.controller';

const router = Router();



router.patch(
    '/',
    auth(USER_ROLE.ADMIN, USER_ROLE.USER),
    ratingController.createRating

);



export const ratingRouter = router;

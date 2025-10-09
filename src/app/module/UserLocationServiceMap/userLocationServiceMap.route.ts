import express from 'express';
import { userLocationServiceMapController } from './userLocationServiceMap.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';

const router = express.Router();


// CRUD routes
router.post('/add', auth(USER_ROLE.ADMIN, USER_ROLE.USER), userLocationServiceMapController.createMap);
router.get('/list', auth(USER_ROLE.ADMIN, USER_ROLE.USER), userLocationServiceMapController.getAllMaps);
router.get('/:id', userLocationServiceMapController.getMap);
router.put('/:id/update', auth(USER_ROLE.ADMIN, USER_ROLE.USER), userLocationServiceMapController.updateMap);
router.delete('/:id/delete', auth(USER_ROLE.ADMIN, USER_ROLE.USER), userLocationServiceMapController.deleteMap);


export const userLocationServiceMapRouter = router;

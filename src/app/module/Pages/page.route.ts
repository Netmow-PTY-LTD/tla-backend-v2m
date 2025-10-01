
import { Router } from 'express';
import { pageController } from './page.controller';


const router = Router();

router.post('/add', pageController.createPageController);
router.get('/list', pageController.getPagesController);
router.get('/:id', pageController.getPageByIdController);
router.put('/:id/update', pageController.updatePageController);
router.delete('/:id/delete', pageController.deletePageController);

export default router;

import { Router } from 'express';
import { leadServiceController } from '../controllers/leadService.controller';

const router = Router();

router.post('/', leadServiceController.createLeadService);
router.get('/', leadServiceController.getLeadServices);
router.patch('/:serviceId/locations', leadServiceController.updateLocations);
router.patch('/:serviceId/online-toggle', leadServiceController.toggleOnline);
router.delete('/:serviceId', leadServiceController.deleteLeadService);

export const leadServiceRouter = router;

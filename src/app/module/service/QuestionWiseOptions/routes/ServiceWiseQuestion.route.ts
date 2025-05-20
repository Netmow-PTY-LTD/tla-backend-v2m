import { Router } from 'express';

import { questionWiseOptionsController } from '../controllers/ServiceWiseQuestion.controller';

const router = Router();

router.get('/', questionWiseOptionsController.getQuestionWiseOptions);

export const questionWiseOptionsRouter = router;

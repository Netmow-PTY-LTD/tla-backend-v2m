import { Router } from 'express';
import { countryController } from './country.controller';

// import validateRequest from '../../../middlewares/validateRequest';

const countryRouter = Router();

countryRouter.post(
  '/',
  // validateRequest(),
  countryController.createCountry,
);

export default countryRouter;

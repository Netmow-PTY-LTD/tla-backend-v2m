import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';

import router from './app/routes';
import config from './app/config';
import apiNotFound from './app/middlewares/apiNotFound';
const app: Application = express();
//parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: [`${config.client_url}`, 'http://localhost:3000', '*'],
    credentials: true,
  }),
);
// app.use(cors({ origin: '*' }));

// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to TLA Backend World');
});

app.use(globalErrorHandler);

//Not Found
app.use(apiNotFound);

export default app;

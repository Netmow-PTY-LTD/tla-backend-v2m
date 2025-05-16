import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import config from './app/config';
import { upload, uploadToSpaces } from './app/config/upload';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: [`${config.client_url}`], credentials: true }));

app.post(
  '/api/v1/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    try {
      // const userId = req.body.userId;
      const userId = 'rrraaabbyy';
      const file = req.file;

      if (!file || !userId) {
        res.status(400).json({ message: 'Missing file or userId' });
        return;
      }

      const url = await uploadToSpaces(file.buffer, file.originalname, userId);
      res.status(200).json({ url });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Upload failed' });
    }
  },
);
// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Backend World');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;

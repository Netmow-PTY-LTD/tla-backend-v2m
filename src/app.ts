import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
import config from './app/config';
import { upload, uploadToSpaces } from './app/config/multerUploder';

const app: Application = express();

//parsers
app.use(express.json());
app.use(cookieParser());

app.use(cors({ origin: [`${config.client_url}`], credentials: true }));

app.post('/api/v1/upload', upload.single('file'), async (req, res) => {
  // const userId = req.user.id; // or however you get the current user
  const userId = 'rrraabbyy'; // or however you get the current user
  try {
    const url = await uploadToSpaces(
      req.file?.buffer,
      req.file.originalname,
      userId,
    );
    res.json({ success: true, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
});
// application routes
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to Backend World');
});

app.use(globalErrorHandler);

//Not Found
app.use(notFound);

export default app;

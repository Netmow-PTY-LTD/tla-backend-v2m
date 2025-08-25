
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import globalErrorHandler from './app/middlewares/globalErrorhandler';
import router from './app/routes';
import config from './app/config';
import apiNotFound from './app/middlewares/apiNotFound';
import { logServerInfo } from './app/utils/serverInfo';
import { userSocketsMap } from './app/sockets';
import ServiceWiseQuestion from './app/module/Question/models/ServiceWiseQuestion.model';
import Option from './app/module/Option/models/option.model';
import mongoose from 'mongoose';
import catchAsync from './app/utils/catchAsync';


// Create Express app
const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  'http://localhost:3000',
  `${config.client_url}`,
  'https://thelawapp.netlify.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);


//  just for test --

// app.get(
//   "/country-wise-question-option",
//   catchAsync(async (req, res) => {
//     const countryId = req.query.countryId as string | undefined;

//     if (!countryId) {
//       res.status(400).json({
//         success: false,
//         message: "countryId is required",
//       });
//       return;
//     }

//     const matchStage: Record<string, any> = {
//       countryId: new mongoose.Types.ObjectId(countryId),
//     };

//     const questions = await ServiceWiseQuestion.aggregate([
//       { $match: matchStage },
//       {
//         $lookup: {
//           from: "options",
//           localField: "_id",
//           foreignField: "questionId",
//           as: "options",
//           pipeline: [
//             { $match: { deletedAt: null } },
//             { $sort: { order: 1 } },
//             { $project: { _id: 1, name: 1, slug: 1, order: 1 } },
//           ],
//         },
//       },

//       {
//         $lookup: {
//           from: "services",
//           localField: "serviceId",
//           foreignField: "_id",
//           as: "service",
//           pipeline: [
//             { $project: { _id: 1, name: 1 } }
//           ]
//         },
//       },
//       { $unwind: "$service" }, // Unwind to get service as an object instead of array


//       { $sort: { order: 1 } },
//       {
//         $project: {
//           _id: 1,
//           question: 1,
//           slug: 1,
//           questionType: 1,
//           order: 1,
//           serviceId: 1,
//           serviceName: "$service.name",
//           options: 1,
          
//         },
//       },
//     ]);

//     if (!questions.length) {
//       res.status(404).json({
//         success: false,
//         message: "No questions found",
//       });
//       return;
//     }

//     res.status(200).json({
//       success: true,
//       data: questions,
//     });
//   })
// );



app.get(
  "/country-wise-question-option",
  catchAsync(async (req, res) => {
    const countryId = req.query.countryId as string | undefined;

    if (!countryId) {
      res.status(400).json({
        success: false,
        message: "countryId is required",
      });
      return;
    }

    const matchStage: Record<string, any> = {
      countryId: new mongoose.Types.ObjectId(countryId),
    };

    const questions = await ServiceWiseQuestion.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "options",
          localField: "_id",
          foreignField: "questionId",
          as: "options",
          pipeline: [
            { $match: { deletedAt: null } },
            { $sort: { order: 1 } },
            { $project: { _id: 1, name: 1, slug: 1, order: 1 } },
          ],
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "serviceId",
          foreignField: "_id",
          as: "service",
          pipeline: [{ $project: { _id: 1, name: 1 } }],
        },
      },
      { $unwind: "$service" }, // get service as object
      { $sort: { order: 1 } },
      {
        $project: {
          _id: 1,
          question: 1,
          slug: 1,
          questionType: 1,
          order: 1,
          serviceId: 1,
          serviceName: "$service.name",
          options: 1,
        },
      },
      {
        $group: {
          _id: "$serviceId",
          serviceName: { $first: "$serviceName" },
          questions: {
            $push: {
              _id: "$_id",
              question: "$question",
              slug: "$slug",
              questionType: "$questionType",
              order: "$order",
              options: "$options",
            },
          },
        },
      },
      { $sort: { "serviceName": 1 } }, // optional: sort services by name
    ]);

    if (!questions.length) {
      res.status(404).json({
        success: false,
        message: "No questions found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: questions,
    });
  })
);










// Routes
app.use('/api/v1', router);

app.get('/server-info', (req: Request, res: Response) => {
  const info = logServerInfo();
  res.status(200).json({
    success: true,
    message: 'Server information retrieved successfully',
    data: info,
  });
});

app.get('/online-users', async (_req: Request, res: Response) => {
  const onlineUserIds = Array.from(userSocketsMap.keys());

  res.status(200).json({
    success: true,
    message: 'Online users fetched successfully.',
    data: {
      count: onlineUserIds.length,
      users: onlineUserIds,
    },
  });


});


// ----------------------------------    for data insert   api ---------------------------------------------





app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to TLA Backend 1.0');
});

app.use(globalErrorHandler);
app.use(apiNotFound);

// Create HTTP server
const server = http.createServer(app);

// Create Socket.IO server using HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Export everything for use in `server.ts`
export { app, server, io };

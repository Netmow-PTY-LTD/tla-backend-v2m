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
//           pipeline: [{ $project: { _id: 1, name: 1 } }],
//         },
//       },
//       { $unwind: "$service" }, // get service as object
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
//       {
//         $group: {
//           _id: "$serviceId",
//           serviceName: { $first: "$serviceName" },
//           questions: {
//             $push: {
//               _id: "$_id",
//               question: "$question",
//               slug: "$slug",
//               questionType: "$questionType",
//               order: "$order",
//               options: "$options",
//             },
//           },
//         },
//       },
//       { $sort: { "serviceName": 1 } }, // optional: sort services by name
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







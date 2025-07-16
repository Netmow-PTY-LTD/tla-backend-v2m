import { NextFunction } from "express";
import { ZodSchema } from "zod";


const validateMultipartRequest = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Merge file into body
      const parsedBody = {
        ...JSON.parse(req.body.data), // contains name, slug, serviceIds
        file: req.file, // multer puts the uploaded file here
      };

      // Validate using Zod
      const validated = schema.parse(parsedBody);

      // Store validated data back into req.body
      req.body = validated;
      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: err.errors || err,
      });
    }
  };
};


export default validateMultipartRequest
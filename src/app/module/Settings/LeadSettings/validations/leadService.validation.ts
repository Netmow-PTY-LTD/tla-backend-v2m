import { z } from 'zod';

export const updateLeadServiceAnswersSchema = {
  body: z.object({
    answers: z.array(
      z.object({
        questionId: z
          .string()
          .length(24, 'Invalid questionId')
          .regex(/^[a-f0-9]{24}$/),
        selectedOptionIds: z
          .array(
            z
              .string()
              .length(24, 'Invalid optionId')
              .regex(/^[a-f0-9]{24}$/),
          )
          .nonempty(),
      }),
    ),
  }),
};

export const leadServiceZodValidation = {
  updateLeadServiceAnswersSchema,
};

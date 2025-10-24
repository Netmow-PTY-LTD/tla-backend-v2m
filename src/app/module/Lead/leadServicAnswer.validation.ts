import { z } from 'zod';
import { zodObjectIdField } from '../../utils/validateObjectId';


export const leadServiceAnswerSchema = z.object({
  body: z.object({
    leadId: zodObjectIdField('Lead'),
    serviceId: zodObjectIdField('service'),
    questionId: zodObjectIdField('question'),
    optionId: zodObjectIdField('option'),
    isSelected: z.boolean(),
    idExtraData: z.string().optional().default(''),
  }),
});

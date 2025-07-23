
import { Types } from 'mongoose';
import Transaction from '../../CreditPayment/models/transaction.model';


export const isVerifiedLawyer = async (userId: Types.ObjectId|string): Promise<boolean> => {
    const creditPurchaseCount = await Transaction.countDocuments({
        userId: userId,
        type: 'purchase',
        status: 'completed'
    });

    return creditPurchaseCount >= 1;
};

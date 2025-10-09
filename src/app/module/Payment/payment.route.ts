import express from 'express';
import { stripeWebhookHandler } from './stripeWebhookHandler';


const router = express.Router();

// Stripe requires raw body for signature verification
router.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }), // 👈 important!
    (req, res, next) => {
        Promise.resolve(stripeWebhookHandler(req, res))
            .then(() => undefined)
            .catch(next);
    }
);







export const paymentRoutes = router;

import express from 'express';
import { stripeWebhookHandler } from './stripeWebhookHandler';
import bodyParser from 'body-parser';


const router = express.Router();

// Stripe requires raw body for signature verification
router.post(
    '/webhooks/stripe',
    // express.raw({ type: 'application/json' }), // 👈 important!
    bodyParser.raw({ type: "application/json" }),
    (req, res, next) => {
        Promise.resolve(stripeWebhookHandler(req, res))
            // .then(() => undefined)
            .catch(next);
    }
);







export const paymentRoutes = router;

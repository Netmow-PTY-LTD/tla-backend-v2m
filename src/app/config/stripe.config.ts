import Stripe from 'stripe';
import config from '../config';

const isProduction = config.NODE_ENV === 'production';

const stripeSecretKey = isProduction ? config.stripe_secret_key_live : config.stripe_secret_key_test;

if (!stripeSecretKey) {
  throw new Error(`Stripe secret key not found for ${isProduction ? 'live' : 'test'} environment`);
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2025-05-28.basil',
});

export const getStripeWebhookSecret = (): string => {
  const webhookSecret = isProduction ? config.stripe_webhook_secret_live : config.stripe_webhook_secret_test;
  if (!webhookSecret) {
    throw new Error(`Stripe webhook secret not found for ${isProduction ? 'live' : 'test'} environment`);
  }
  return webhookSecret;
};

export const getCurrentEnvironment = (): 'test' | 'live' => {
  return isProduction ? 'live' : 'test';
};

export const isTestMode = (): boolean => !isProduction;
export const isLiveMode = (): boolean => isProduction;
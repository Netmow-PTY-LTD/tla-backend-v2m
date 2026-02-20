import Stripe from 'stripe';
import config from '../config';

const stripeTestKey = config.stripe_secret_key_test;
const stripeLiveKey = config.stripe_secret_key_live;

export const stripeTest = stripeTestKey ? new Stripe(stripeTestKey, {
  apiVersion: '2025-05-28.basil',
}) : null;

export const stripeLive = stripeLiveKey ? new Stripe(stripeLiveKey, {
  apiVersion: '2025-05-28.basil',
}) : null;

const isProduction = config.NODE_ENV === 'production';

export const stripe = isProduction ? (stripeLive || stripeTest!) : (stripeTest || stripeLive!);

export const getStripeWebhookSecret = (): string => {
  const webhookSecret = isProduction ? config.stripe_webhook_secret_live : config.stripe_webhook_secret_test;
  if (!webhookSecret) {
    throw new Error(`Stripe webhook secret not found for ${isProduction ? 'live' : 'test'} environment`);
  }
  return webhookSecret;
};

export const getCurrentEnvironment = (): 'test' | 'live' => {
  // In the future, this might be dynamic based on a DB setting
  return isProduction ? 'live' : 'test';
};

export const isTestMode = (): boolean => getCurrentEnvironment() === 'test';
export const isLiveMode = (): boolean => getCurrentEnvironment() === 'live';
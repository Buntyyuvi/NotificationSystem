import * as twilio from 'twilio';
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: twilio.Twilio | null = null;

function getClient(): twilio.Twilio | null {
  if (twilioClient) return twilioClient;
  if (!ACCOUNT_SID || !AUTH_TOKEN) {
    logger.warn('Twilio not configured, SMS disabled');
    return null;
  }
  twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN);
  return twilioClient;
}

export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = getClient();

    if (!client) {
      logger.warn('Twilio client not initialized, skipping SMS', { to });
      return { success: true };
    }

    if (!FROM_NUMBER) {
      return { success: false, error: 'TWILIO_PHONE_NUMBER not configured' };
    }

    await client.messages.create({
      body,
      from: FROM_NUMBER,
      to
    });

    logger.info('SMS sent successfully', { to });
    return { success: true };
  } catch (error: any) {
    logger.error('SMS send failed', { to, error: error.message });
    return { success: false, error: error.message };
  }
}

import twilio from 'twilio';
import { createLogger } from '@notification-system/shared-logger';
import { env } from '../config/env';

const logger = createLogger('delivery-service');

let client: ReturnType<typeof twilio> | null = null;

function isConfigured(): boolean {
  return Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN);
}

function ensureClient(): boolean {
  if (client) return true;
  if (!isConfigured()) return false;
  client = twilio(env.TWILIO_ACCOUNT_SID!, env.TWILIO_AUTH_TOKEN!);
  return true;
}

export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    if (!to) {
      logger.info('SMS skipped: no recipient phone', { body: body.slice(0, 20) });
      return { success: true, skipped: true };
    }

    if (!ensureClient() || !env.TWILIO_PHONE_NUMBER) {
      logger.info('SMS skipped: Twilio not configured', { to });
      return { success: true, skipped: true };
    }

    const message = await client!.messages.create({
      body,
      from: env.TWILIO_PHONE_NUMBER,
      to
    });

    logger.info('SMS sent', { to, sid: message.sid });
    return { success: true };
  } catch (error: any) {
    logger.error('SMS send failed', { to, error: error.message });
    return { success: false, error: error.message };
  }
}

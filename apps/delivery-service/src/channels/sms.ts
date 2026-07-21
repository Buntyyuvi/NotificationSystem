import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

// Placeholder — integrate Twilio
export async function sendSMS(
  to: string,
  body: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('SMS (placeholder)', { to, body: body.slice(0, 20) });
    // TODO: Integrate Twilio
    // await twilioClient.messages.create({ body, from: env.TWILIO_PHONE_NUMBER, to });
    return { success: true };
  } catch (error: any) {
    logger.error('SMS failed', { to, error: error.message });
    return { success: false, error: error.message };
  }
}
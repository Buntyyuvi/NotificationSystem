import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

// Placeholder — integrate SendGrid or Nodemailer
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Email (placeholder)', { to, subject });
    // TODO: Integrate SendGrid
    // await sgMail.send({ to, from: 'noreply@example.com', subject, html, text });
    return { success: true };
  } catch (error: any) {
    logger.error('Email failed', { to, error: error.message });
    return { success: false, error: error.message };
  }
}
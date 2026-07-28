import * as sgMail from "@sendgrid/mail";
import { createLogger } from '@notification-system/shared-logger';

const logger = createLogger('delivery-service');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@notificationsystem.com';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!SENDGRID_API_KEY) {
      logger.warn('SendGrid not configured, skipping email', { to });
      return { success: true };
    }

    await sgMail.send({
      to,
      from: FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '')
    });

    logger.info('Email sent successfully', { to, subject });
    return { success: true };
  } catch (error: any) {
    logger.error('Email send failed', { to, error: error.message });
    return { success: false, error: error.message };
  }
}

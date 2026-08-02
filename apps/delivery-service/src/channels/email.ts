import sgMail from '@sendgrid/mail';
import { createLogger } from '@notification-system/shared-logger';
import { env } from '../config/env';

const logger = createLogger('delivery-service');

let initialized = false;

function isConfigured(): boolean {
  return Boolean(env.SENDGRID_API_KEY);
}

function ensureInitialized(): boolean {
  if (!isConfigured()) return false;
  if (!initialized) {
    sgMail.setApiKey(env.SENDGRID_API_KEY!);
    initialized = true;
  }
  return true;
}

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string; skipped?: boolean }> {
  try {
    if (!to) {
      logger.info('Email skipped: no recipient', { subject });
      return { success: true, skipped: true };
    }

    if (!ensureInitialized()) {
      logger.info('Email skipped: SENDGRID_API_KEY not configured', { to, subject });
      return { success: true, skipped: true };
    }

    await sgMail.send({
      to,
      from: env.SENDGRID_FROM_EMAIL,
      subject,
      html,
      text: text || ''
    });

    logger.info('Email sent', { to, subject });
    return { success: true };
  } catch (error: any) {
    logger.error('Email failed', { to, error: error.message });
    return { success: false, error: error.message };
  }
}

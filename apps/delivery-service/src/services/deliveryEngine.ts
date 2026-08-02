import {
  NotificationChannel,
  DeliveryStatus,
} from "@notification-system/shared-types";
import { User, DeliveryLog } from "@notification-system/shared-db";
import { createLogger } from "@notification-system/shared-logger";
import { sendWebSocket } from "../channels/websocket";
import { sendPush } from "../channels/push";
import { sendEmail } from "../channels/email";
import { sendSMS } from "../channels/sms";
import { saveNotification, updateNotificationStatus } from './notificationStore';

const logger = createLogger("delivery-service");

interface DeliveryPayload {
  eventId: string;
  userId: string;
  type: string;
  channels: string[];
  payload: Record<string, unknown>;
  priority: string;
}

export async function deliverNotification(
  payload: DeliveryPayload,
): Promise<boolean> {
  const user = await User.findOne({ userId: payload.userId });

  if (!user) {
    logger.warn("User not found", { userId: payload.userId });
    return true;
  }

  // Save notification to history first (idempotent by eventId)
  await saveNotification({
    eventId: payload.eventId,
    userId: payload.userId,
    type: payload.type,
    payload: payload.payload,
    channels: payload.channels,
    priority: payload.priority,
  });

  let allSuccess = true;

  for (const channel of payload.channels) {
    const startTime = Date.now();
    let result: { success: boolean; error?: string };

    try {
      switch (channel) {
        case NotificationChannel.WEBSOCKET:
          result = await sendWebSocket(
            payload.userId,
            payload.eventId,
            payload.type,
            payload.payload,
          );
          break;

        case NotificationChannel.PUSH:
          result = await sendPush(
            user.devices.map((d) => d.token),
            payload.type.replace(/_/g, " "),
            JSON.stringify(payload.payload),
            { eventId: payload.eventId, type: payload.type },
          );
          break;

        case NotificationChannel.EMAIL:
          result = await sendEmail(
            user.email,
            `${payload.type.replace(/_/g, " ")}`,
            `<p>${JSON.stringify(payload.payload)}</p>`,
            JSON.stringify(payload.payload),
          );
          break;

        case NotificationChannel.SMS:
          result = await sendSMS(
            user.phone || "",
            `${payload.type}: ${JSON.stringify(payload.payload).slice(0, 100)}`,
          );
          break;

        default:
          result = { success: false, error: `Unknown channel: ${channel}` };
      }

      // Log delivery attempt
      await DeliveryLog.create({
        notificationId: payload.eventId,
        channel,
        status: result.success
          ? DeliveryStatus.DELIVERED
          : DeliveryStatus.FAILED,
        errorMessage: result.error,
        attemptedAt: new Date(startTime),
        completedAt: new Date(),
      });

      await updateNotificationStatus(
        payload.eventId,
        channel,
        result.success ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED,
        result.error
      );

      if (!result.success) {
        allSuccess = false;
      }

      logger.info("Delivery attempt", {
        eventId: payload.eventId,
        channel,
        success: result.success,
        duration: Date.now() - startTime,
      });
    } catch (error: any) {
      await DeliveryLog.create({
        notificationId: payload.eventId,
        channel,
        status: DeliveryStatus.FAILED,
        errorMessage: error.message,
        attemptedAt: new Date(startTime),
        completedAt: new Date(),
      });

      allSuccess = false;
      logger.error("Delivery crashed", {
        eventId: payload.eventId,
        channel,
        error: error.message,
      });
    }
  }

  return allSuccess;
}

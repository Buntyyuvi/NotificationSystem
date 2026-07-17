import mongoose, { Schema, Document } from 'mongoose';
import { NotificationChannel, DeliveryStatus } from '@notification-system/shared-types';

export interface IDeliveryLog extends Document {
  notificationId: string;
  channel: NotificationChannel;
  status: DeliveryStatus;
  providerResponse?: string;
  errorMessage?: string;
  attemptedAt: Date;
  completedAt?: Date;
}

const DeliveryLogSchema = new Schema<IDeliveryLog>({
  notificationId: { type: String, required: true, index: true },
  channel: { type: String, enum: Object.values(NotificationChannel), required: true },
  status: { type: String, enum: Object.values(DeliveryStatus), required: true },
  providerResponse: { type: String },
  errorMessage: { type: String },
  attemptedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

export const DeliveryLog = mongoose.model<IDeliveryLog>('DeliveryLog', DeliveryLogSchema);
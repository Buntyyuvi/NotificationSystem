import mongoose, { Schema, Document } from 'mongoose';
import { NotificationChannel, DeliveryStatus, Priority } from '@notification-system/shared-types';

export interface INotification extends Document {
  eventId: string;
  userId: string;
  type: string;
  payload: Record<string, unknown>;
  channels: NotificationChannel[];
  priority: Priority;
  status: DeliveryStatus;
  content?: Record<string, unknown>;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  errorMessage?: string;
  readAt?: Date;
  deliveryAttempts: {
    channel: string;
    status: string;
    attemptedAt: Date;
  }[];
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  eventId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  channels: [{ type: String, enum: Object.values(NotificationChannel) }],
  priority: { type: String, enum: Object.values(Priority), default: Priority.MEDIUM },
  status: { type: String, enum: Object.values(DeliveryStatus), default: DeliveryStatus.PENDING },
  content: { type: Schema.Types.Mixed },
  sentAt: { type: Date },
  deliveredAt: { type: Date },
  failedAt: { type: Date },
  errorMessage: { type: String },
  readAt: { type: Date },
  deliveryAttempts: [{
    channel: { type: String },
    status: { type: String },
    attemptedAt: { type: Date }
  }]
}, { timestamps: true });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
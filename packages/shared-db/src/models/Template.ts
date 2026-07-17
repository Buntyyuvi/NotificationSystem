import mongoose, { Schema, Document } from 'mongoose';
import { NotificationChannel } from '@notification-system/shared-types';

export interface ITemplate extends Document {
  name: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  variables: string[];
  locale: string;
  isActive: boolean;
}

const TemplateSchema = new Schema<ITemplate>({
  name: { type: String, required: true },
  channel: { type: String, enum: Object.values(NotificationChannel), required: true },
  subject: { type: String },
  body: { type: String, required: true },
  variables: [{ type: String }],
  locale: { type: String, default: 'en' },
  isActive: { type: Boolean, default: true }
});

export const Template = mongoose.model<ITemplate>('Template', TemplateSchema);
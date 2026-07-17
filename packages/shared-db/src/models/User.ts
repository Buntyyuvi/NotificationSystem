import mongoose, { Schema, Document } from 'mongoose';
import { NotificationChannel } from '@notification-system/shared-types';

export interface IUser extends Document {
  userId: string;
  email: string;
  phone?: string;
  devices: { token: string; platform: 'ios' | 'android' | 'web' }[];
  preferences: {
    channel: NotificationChannel;
    enabled: boolean;
    digestMode: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true },
  phone: { type: String },
  devices: [{
    token: { type: String, required: true },
    platform: { type: String, enum: ['ios', 'android', 'web'] }
  }],
  preferences: [{
    channel: { type: String, enum: Object.values(NotificationChannel) },
    enabled: { type: Boolean, default: true },
    digestMode: { type: Boolean, default: false }
  }]
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', UserSchema);
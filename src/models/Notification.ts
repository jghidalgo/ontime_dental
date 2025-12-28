import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string;
  companyId?: string;
  title: string;
  message: string;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    companyId: {
      type: String,
      required: false,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    readAt: {
      type: Date,
      required: false,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

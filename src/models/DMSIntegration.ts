import mongoose, { Schema, Document } from 'mongoose';

export interface IDMSIntegration extends Document {
  companyId: string;
  provider: 'open-dental' | 'dentrix' | 'eaglesoft' | 'practice-works';
  serverHost: string;
  serverPort: number;
  username: string;
  password: string; // This should be encrypted in production
  database: string;
  isActive: boolean;
  lastSyncAt?: Date;
  lastSyncResult?: {
    success: boolean;
    message: string;
    patientsAdded: number;
    patientsUpdated: number;
    patientsSkipped: number;
    errors: string[];
  };
  isSyncing?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DMSIntegrationSchema = new Schema<IDMSIntegration>(
  {
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      required: true,
      enum: ['open-dental', 'dentrix', 'eaglesoft', 'practice-works'],
    },
    serverHost: {
      type: String,
      required: true,
    },
    serverPort: {
      type: Number,
      required: true,
      default: 3306,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      // In production, this should be encrypted
    },
    database: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSyncAt: {
      type: Date,
    },
    lastSyncResult: {
      type: {
        success: Boolean,
        message: String,
        patientsAdded: Number,
        patientsUpdated: Number,
        patientsSkipped: Number,
        errors: [String],
      },
      required: false,
    },
    isSyncing: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for company and provider (one provider per company typically)
DMSIntegrationSchema.index({ companyId: 1, provider: 1 });

export default mongoose.models.DMSIntegration || mongoose.model<IDMSIntegration>('DMSIntegration', DMSIntegrationSchema);

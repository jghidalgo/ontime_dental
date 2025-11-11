import mongoose, { Schema, model, models } from 'mongoose';

export interface IInsurance {
  insurerId: string;
  name: string;
  companyId: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  policyPrefix?: string;
  notes?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const insuranceSchema = new Schema<IInsurance>(
  {
    insurerId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    contactName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zip: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    policyPrefix: {
      type: String,
      trim: true,
      uppercase: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for uniqueness per company
insuranceSchema.index({ companyId: 1, insurerId: 1 }, { unique: true });
insuranceSchema.index({ companyId: 1, name: 1 });
insuranceSchema.index({ companyId: 1, isActive: 1 });

const Insurance = models.Insurance || model<IInsurance>('Insurance', insuranceSchema);

export default Insurance;

import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  shortName: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shortName: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
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
    taxId: {
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

// Index for faster queries
CompanySchema.index({ name: 1 });
CompanySchema.index({ shortName: 1 });
CompanySchema.index({ isActive: 1 });

export default mongoose.models.Company || mongoose.model<ICompany>('Company', CompanySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IPatient extends Document {
  firstName: string;
  lastName: string;
  birthday: Date;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  companyId?: string; // Optional: to track which company the patient belongs to
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new Schema<IPatient>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    birthday: {
      type: Date,
      required: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zip: {
      type: String,
      trim: true
    },
    notes: {
      type: String
    },
    companyId: {
      type: String,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
PatientSchema.index({ firstName: 1, lastName: 1 });
PatientSchema.index({ birthday: 1 });

export default mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);

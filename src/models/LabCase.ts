import mongoose, { Schema, Document } from 'mongoose';

export interface ILabCase extends Document {
  caseId: string;
  companyId: string;
  lab: string;
  clinic: string;
  patientFirstName: string;
  patientLastName: string;
  birthday: string;
  reservationDate: string;
  doctor: string;
  procedure: string;
  status: 'in-production' | 'in-transit' | 'completed' | 'in-planning';
  category: string;
  priority: 'normal' | 'rush' | 'urgent';
  shadeGuide?: string;
  materialType?: string;
  notes?: string;
  toothNumbers?: string[];
  estimatedCompletion?: string;
  actualCompletion?: string;
  technician?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabCaseSchema: Schema = new Schema(
  {
    caseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    companyId: {
      type: String,
      required: true,
      index: true,
    },
    lab: {
      type: String,
      required: true,
      trim: true,
    },
    clinic: {
      type: String,
      required: true,
      trim: true,
    },
    patientFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    patientLastName: {
      type: String,
      required: true,
      trim: true,
    },
    birthday: {
      type: String,
      required: true,
    },
    reservationDate: {
      type: String,
      required: true,
    },
    doctor: {
      type: String,
      required: true,
      trim: true,
    },
    procedure: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['in-production', 'in-transit', 'completed', 'in-planning'],
      default: 'in-planning',
    },
    category: {
      type: String,
      required: true,
      enum: ['Crowns & Bridges', 'Implant Restorations', 'Try-in / Wax Setups', 'Aligners & Ortho', 'Repairs & Adjustments', 'Other'],
    },
    priority: {
      type: String,
      enum: ['normal', 'rush', 'urgent'],
      default: 'normal',
    },
    shadeGuide: {
      type: String,
      trim: true,
    },
    materialType: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    toothNumbers: [{
      type: String,
    }],
    estimatedCompletion: {
      type: String,
    },
    actualCompletion: {
      type: String,
    },
    technician: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better query performance
LabCaseSchema.index({ caseId: 1 });
LabCaseSchema.index({ companyId: 1 });
LabCaseSchema.index({ companyId: 1, status: 1 });
LabCaseSchema.index({ companyId: 1, reservationDate: -1 });
LabCaseSchema.index({ clinic: 1, status: 1 });
LabCaseSchema.index({ doctor: 1 });
LabCaseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.LabCase || mongoose.model<ILabCase>('LabCase', LabCaseSchema);

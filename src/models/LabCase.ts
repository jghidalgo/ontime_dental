import mongoose, { Schema, Document } from 'mongoose';

export interface ILabCase extends Document {
  caseId: string;
  companyId: string;
  patientId: string; // Reference to Patient
  labId?: string; // Reference to Laboratory
  lab: string;
  clinicId?: string; // Reference to ClinicLocation
  clinic: string;
  patientFirstName: string;
  patientLastName: string;
  birthday: string;
  reservationDate: string;
  doctorId?: string; // Reference to User (doctor)
  doctor: string;
  procedure: string;
  price?: number;
  status: 'in-production' | 'in-transit' | 'completed' | 'in-planning';
  productionStage?: 'design' | 'printing' | 'milling' | 'finishing' | 'qc' | 'packaging';
  category: string;
  priority: 'normal' | 'rush' | 'urgent';
  shadeGuide?: string;
  materialType?: string;
  notes?: string;
  toothNumbers?: string[];
  estimatedCompletion?: string;
  actualCompletion?: string;
  technicianId?: string; // Reference to User (technician)
  technician?: string;
  qrCode?: string; // Base64 encoded QR code image
  qrCodeData?: string; // The data encoded in the QR code
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
    patientId: {
      type: String,
      required: true,
      index: true,
    },
    labId: {
      type: String,
      index: true,
    },
    lab: {
      type: String,
      required: true,
      trim: true,
    },
    clinicId: {
      type: String,
      index: true,
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
    doctorId: {
      type: String,
      index: true,
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
    price: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-production', 'in-transit', 'completed', 'in-planning'],
      default: 'in-planning',
    },
    productionStage: {
      type: String,
      enum: ['design', 'printing', 'milling', 'finishing', 'qc', 'packaging'],
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
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
    technicianId: {
      type: String,
      index: true,
    },
    technician: {
      type: String,
      trim: true,
    },
    qrCode: {
      type: String, // Base64 encoded QR code image
    },
    qrCodeData: {
      type: String, // The data encoded in the QR code
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
LabCaseSchema.index({ companyId: 1, status: 1, productionStage: 1 });
LabCaseSchema.index({ companyId: 1, reservationDate: -1 });
LabCaseSchema.index({ clinic: 1, status: 1 });
LabCaseSchema.index({ clinicId: 1 });
LabCaseSchema.index({ clinicId: 1, status: 1 });
LabCaseSchema.index({ doctor: 1 });
LabCaseSchema.index({ doctorId: 1 });
LabCaseSchema.index({ labId: 1 });
LabCaseSchema.index({ technicianId: 1 });
LabCaseSchema.index({ patientId: 1 });
LabCaseSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.LabCase || mongoose.model<ILabCase>('LabCase', LabCaseSchema);

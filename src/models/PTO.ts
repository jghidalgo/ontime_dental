import mongoose, { Schema, Document } from 'mongoose';

export interface IPTO extends Document {
  employeeId: string;
  companyId?: string;
  policyLeaveTypeId?: string;
  policyLeaveTypeName?: string;
  leaveType: 'paid' | 'unpaid';
  startDate: string;
  endDate: string;
  requestedDays: number;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  requestedBy: string; // User who requested
  reviewedBy?: string; // User who approved/rejected
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PTOSchema = new Schema<IPTO>(
  {
    employeeId: {
      type: String,
      required: true,
      index: true
    },
    companyId: {
      type: String,
      required: false,
      index: true
    },
    policyLeaveTypeId: {
      type: String,
      required: false,
      index: true
    },
    policyLeaveTypeName: {
      type: String,
      required: false,
      trim: true
    },
    leaveType: {
      type: String,
      enum: ['paid', 'unpaid'],
      required: true
    },
    startDate: {
      type: String,
      required: true
    },
    endDate: {
      type: String,
      required: true
    },
    requestedDays: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    comment: {
      type: String,
      trim: true
    },
    requestedBy: {
      type: String,
      required: true
    },
    reviewedBy: {
      type: String
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Create compound indexes
PTOSchema.index({ employeeId: 1, status: 1 });
PTOSchema.index({ companyId: 1, status: 1 });
PTOSchema.index({ companyId: 1, employeeId: 1 });
PTOSchema.index({ companyId: 1, policyLeaveTypeId: 1, status: 1 });
PTOSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.models.PTO || mongoose.model<IPTO>('PTO', PTOSchema);

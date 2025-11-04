import mongoose, { Schema, Document } from 'mongoose';

export interface ILeaveType {
  id: string;
  name: string;
  hoursAllowed: number;
  isPaid: boolean;
  isActive: boolean;
}

export interface ICompanyPTOPolicy extends Document {
  companyId: string;
  leaveTypes: ILeaveType[];
  createdAt: Date;
  updatedAt: Date;
}

const LeaveTypeSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  hoursAllowed: { type: Number, required: true, default: 0 },
  isPaid: { type: Boolean, required: true, default: true },
  isActive: { type: Boolean, required: true, default: true },
}, { _id: false });

const CompanyPTOPolicySchema = new Schema<ICompanyPTOPolicy>(
  {
    companyId: { type: String, required: true, unique: true, index: true },
    leaveTypes: { type: [LeaveTypeSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

// Create index on companyId
CompanyPTOPolicySchema.index({ companyId: 1 });

const CompanyPTOPolicy = mongoose.models.CompanyPTOPolicy || mongoose.model<ICompanyPTOPolicy>('CompanyPTOPolicy', CompanyPTOPolicySchema);

export default CompanyPTOPolicy;

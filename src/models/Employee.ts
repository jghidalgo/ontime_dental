import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
  userId?: string; // Reference to User
  companyId?: string;
  name: string;
  joined: string;
  dateOfBirth: string;
  phone: string;
  position: string;
  location: string;
  email?: string;
  department?: string;
  status: 'active' | 'inactive' | 'on-leave';
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  // PTO Balance fields
  ptoAllowance?: number; // Total PTO days per year (default: 15)
  ptoUsed?: number; // Days consumed in current year
  ptoAvailable?: number; // Remaining days (calculated: allowance - used)
  ptoYear?: number; // Year for PTO tracking (resets annually)
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: String,
      required: false,
      index: true
    },
    companyId: {
      type: String,
      required: false,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    joined: {
      type: String,
      required: true
    },
    dateOfBirth: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    department: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'on-leave'],
      default: 'active'
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    },
    // PTO Balance fields
    ptoAllowance: {
      type: Number,
      default: 15 // Default 15 days per year
    },
    ptoUsed: {
      type: Number,
      default: 0
    },
    ptoAvailable: {
      type: Number,
      default: 15
    },
    ptoYear: {
      type: Number,
      default: () => new Date().getFullYear()
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
EmployeeSchema.index({ companyId: 1 });
EmployeeSchema.index({ companyId: 1, name: 'text', position: 'text', location: 'text' });
EmployeeSchema.index({ companyId: 1, status: 1 });
EmployeeSchema.index({ companyId: 1, location: 1 });
EmployeeSchema.index({ companyId: 1, position: 1 });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

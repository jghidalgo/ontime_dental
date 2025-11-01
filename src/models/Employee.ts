import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeId: string;
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
    }
  },
  {
    timestamps: true
  }
);

// Create indexes
EmployeeSchema.index({ name: 'text', position: 'text', location: 'text' });
EmployeeSchema.index({ status: 1 });
EmployeeSchema.index({ location: 1 });
EmployeeSchema.index({ position: 1 });

export default mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);

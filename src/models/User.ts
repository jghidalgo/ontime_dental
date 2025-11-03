import { Schema, model, models } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'dentist' | 'hygienist' | 'assistant' | 'receptionist' | 'lab_tech';
  companyId?: string; // Reference to Company
  phone?: string;
  position?: string;
  department?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'dentist', 'hygienist', 'assistant', 'receptionist', 'lab_tech'],
      default: 'receptionist'
    },
    companyId: {
      type: String,
      required: false,
      trim: true
    },
    phone: {
      type: String,
      required: false,
      trim: true
    },
    position: {
      type: String,
      required: false,
      trim: true
    },
    department: {
      type: String,
      required: false,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ companyId: 1 });
userSchema.index({ isActive: 1 });

const User = models.User || model<IUser>('User', userSchema);

export default User;

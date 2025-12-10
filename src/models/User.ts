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
  permissions?: {
    modules: string[];
    canModifySchedules?: boolean;
    canModifyDocuments?: boolean;
    canViewAllTickets?: boolean;
    canModifyTickets?: boolean;
    canViewReports?: boolean;
    canManageUsers?: boolean;
    canModifyContacts?: boolean;
    canAccessLaboratory?: boolean;
    canManageTransit?: boolean;
  };
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
    },
    permissions: {
      type: {
        modules: {
          type: [String],
          default: []
        },
        canModifySchedules: {
          type: Boolean,
          default: false
        },
        canModifyDocuments: {
          type: Boolean,
          default: true
        },
        canViewAllTickets: {
          type: Boolean,
          default: false
        },
        canModifyTickets: {
          type: Boolean,
          default: true
        },
        canViewReports: {
          type: Boolean,
          default: false
        },
        canManageUsers: {
          type: Boolean,
          default: false
        },
        canModifyContacts: {
          type: Boolean,
          default: false
        },
        canAccessLaboratory: {
          type: Boolean,
          default: false
        },
        canManageTransit: {
          type: Boolean,
          default: false
        }
      },
      default: () => ({
        modules: ['dashboard', 'documents', 'tickets'],
        canModifySchedules: false,
        canModifyDocuments: true,
        canViewAllTickets: false,
        canModifyTickets: true,
        canViewReports: false,
        canManageUsers: false,
        canModifyContacts: false,
        canAccessLaboratory: false,
        canManageTransit: false
      })
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

import mongoose, { Schema, Document } from 'mongoose';

export interface ILaboratory extends Document {
  name: string;
  shortName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  website?: string;
  taxId?: string;
  specialties: string[];
  turnaroundTime: {
    standard: number; // in days
    rush: number; // in days
  };
  procedures?: {
    name: string;
    dailyCapacity: number;
  }[];
  departments?: {
    id: string;
    name: string;
    description: string;
    order: number;
  }[];
  priceList?: {
    category: string;
    price: number;
  }[];
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LaboratorySchema = new Schema<ILaboratory>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    shortName: {
      type: String,
      required: true,
      trim: true
    },
    contactPerson: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zip: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: 'USA',
      trim: true
    },
    website: {
      type: String,
      trim: true
    },
    taxId: {
      type: String,
      trim: true
    },
    specialties: {
      type: [String],
      default: []
    },
    turnaroundTime: {
      standard: {
        type: Number,
        required: true,
        default: 7
      },
      rush: {
        type: Number,
        required: true,
        default: 3
      }
    },
    procedures: [
      {
        name: {
          type: String,
          required: true
        },
        dailyCapacity: {
          type: Number,
          required: true,
          default: 10
        }
      }
    ],
    departments: [
      {
        id: {
          type: String,
          required: true
        },
        name: {
          type: String,
          required: true
        },
        description: {
          type: String,
          default: ''
        },
        order: {
          type: Number,
          required: true
        }
      }
    ],
    priceList: [
      {
        category: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    notes: {
      type: String,
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

// Index for efficient queries
LaboratorySchema.index({ isActive: 1 });
LaboratorySchema.index({ name: 1 });

export default mongoose.models.Laboratory || mongoose.model<ILaboratory>('Laboratory', LaboratorySchema);

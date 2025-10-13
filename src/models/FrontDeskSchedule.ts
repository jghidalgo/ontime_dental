import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee {
  id: string;
  name: string;
}

export interface IFrontDeskSchedule extends Document {
  positionId: string; // 'front-desk', 'assistant-1', 'assistant-2'
  clinicId: string;   // 'ce', 'miller'
  employee: IEmployee | null;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, { _id: false });

const FrontDeskScheduleSchema = new Schema<IFrontDeskSchedule>(
  {
    positionId: {
      type: String,
      required: true,
      enum: ['front-desk', 'assistant-1', 'assistant-2'],
      index: true
    },
    clinicId: {
      type: String,
      required: true,
      enum: ['ce', 'miller'],
      index: true
    },
    employee: {
      type: EmployeeSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique position-clinic combinations
FrontDeskScheduleSchema.index({ positionId: 1, clinicId: 1 }, { unique: true });

const FrontDeskSchedule = mongoose.models.FrontDeskSchedule || 
  mongoose.model<IFrontDeskSchedule>('FrontDeskSchedule', FrontDeskScheduleSchema);

export default FrontDeskSchedule;

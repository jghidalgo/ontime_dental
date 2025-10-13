import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorAssignment {
  id: string;
  name: string;
  shift: 'AM' | 'PM';
}

export interface IDoctorSchedule extends Document {
  dayId: string;      // 'monday', 'tuesday', etc.
  clinicId: string;   // 'ce', 'miller'
  doctor: IDoctorAssignment | null;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorAssignmentSchema = new Schema<IDoctorAssignment>({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    required: true,
    enum: ['AM', 'PM']
  }
}, { _id: false });

const DoctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    dayId: {
      type: String,
      required: true,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      index: true
    },
    clinicId: {
      type: String,
      required: true,
      enum: ['ce', 'miller'],
      index: true
    },
    doctor: {
      type: DoctorAssignmentSchema,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure unique day-clinic combinations
DoctorScheduleSchema.index({ dayId: 1, clinicId: 1 }, { unique: true });

const DoctorSchedule = mongoose.models.DoctorSchedule || 
  mongoose.model<IDoctorSchedule>('DoctorSchedule', DoctorScheduleSchema);

export default DoctorSchedule;

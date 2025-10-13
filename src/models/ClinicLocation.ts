import mongoose, { Schema, Document } from 'mongoose';

export interface ICoordinates {
  lat: number;
  lng: number;
}

export interface IClinic {
  clinicId: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  hours: string;
  coordinates: ICoordinates;
}

export interface IClinicLocation extends Document {
  companyId: string;
  companyName: string;
  headquarters: string;
  description: string;
  mapCenter: ICoordinates;
  clinics: IClinic[];
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema<ICoordinates>(
  {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const ClinicSchema = new Schema<IClinic>(
  {
    clinicId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    zip: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    hours: {
      type: String,
      required: true
    },
    coordinates: {
      type: CoordinatesSchema,
      required: true
    }
  },
  { _id: false }
);

const ClinicLocationSchema = new Schema<IClinicLocation>(
  {
    companyId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    companyName: {
      type: String,
      required: true
    },
    headquarters: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    mapCenter: {
      type: CoordinatesSchema,
      required: true
    },
    clinics: [ClinicSchema]
  },
  {
    timestamps: true,
    collection: 'clinic_locations'
  }
);

export default mongoose.models.ClinicLocation || mongoose.model<IClinicLocation>('ClinicLocation', ClinicLocationSchema);

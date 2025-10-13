import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectoryEntry extends Document {
  entityId: string;
  group: 'corporate' | 'frontdesk' | 'offices';
  location: string;
  phone: string;
  extension: string;
  department: string;
  employee: string;
  createdAt: Date;
  updatedAt: Date;
}

const DirectoryEntrySchema = new Schema<IDirectoryEntry>(
  {
    entityId: {
      type: String,
      required: true,
      index: true
    },
    group: {
      type: String,
      required: true,
      enum: ['corporate', 'frontdesk', 'offices'],
      index: true
    },
    location: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    extension: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    employee: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
    collection: 'directory_entries'
  }
);

// Compound index for efficient queries
DirectoryEntrySchema.index({ entityId: 1, group: 1 });

export default mongoose.models.DirectoryEntry || mongoose.model<IDirectoryEntry>('DirectoryEntry', DirectoryEntrySchema);

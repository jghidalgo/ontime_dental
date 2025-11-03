import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectoryEntity extends Document {
  entityId: string;
  name: string;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

const DirectoryEntitySchema = new Schema<IDirectoryEntity>(
  {
    entityId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    companyId: {
      type: String,
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'directory_entities'
  }
);

// Index for company-based queries
DirectoryEntitySchema.index({ companyId: 1 });

export default mongoose.models.DirectoryEntity || mongoose.model<IDirectoryEntity>('DirectoryEntity', DirectoryEntitySchema);

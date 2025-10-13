import mongoose, { Schema, Document } from 'mongoose';

export interface IDirectoryEntity extends Document {
  entityId: string;
  name: string;
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
    }
  },
  {
    timestamps: true,
    collection: 'directory_entities'
  }
);

export default mongoose.models.DirectoryEntity || mongoose.model<IDirectoryEntity>('DirectoryEntity', DirectoryEntitySchema);

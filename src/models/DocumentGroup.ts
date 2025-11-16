import mongoose, { Schema, Document } from 'mongoose';

export interface IDocumentGroup extends Document {
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentGroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
DocumentGroupSchema.index({ isActive: 1, order: 1 });
DocumentGroupSchema.index({ name: 1 });

export default mongoose.models.DocumentGroup || mongoose.model<IDocumentGroup>('DocumentGroup', DocumentGroupSchema);

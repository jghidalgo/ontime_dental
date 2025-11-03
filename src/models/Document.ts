import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDocumentRecord {
  id: string;
  title: string;
  version: string;
  date: string;
  description: string;
  url: string;
  fileName?: string;
}

export interface IDocumentGroup {
  id: string;
  name: string;
  documents: IDocumentRecord[];
}

export interface IDocumentEntity extends Document {
  entityId: string;
  name: string;
  companyId: string;
  groups: IDocumentGroup[];
}

const DocumentRecordSchema = new Schema<IDocumentRecord>(
  {
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    version: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true
    },
    fileName: {
      type: String
    }
  },
  { _id: false }
);

const DocumentGroupSchema = new Schema<IDocumentGroup>(
  {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    documents: {
      type: [DocumentRecordSchema],
      default: []
    }
  },
  { _id: false }
);

const DocumentEntitySchema = new Schema<IDocumentEntity>(
  {
    entityId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    companyId: {
      type: String,
      required: true,
      index: true
    },
    groups: {
      type: [DocumentGroupSchema],
      default: []
    }
  },
  {
    timestamps: true
  }
);

// Indexes for common queries
DocumentEntitySchema.index({ entityId: 1 });
DocumentEntitySchema.index({ companyId: 1 });
DocumentEntitySchema.index({ name: 1 });

const DocumentEntity: Model<IDocumentEntity> =
  mongoose.models.DocumentEntity || mongoose.model<IDocumentEntity>('DocumentEntity', DocumentEntitySchema);

export default DocumentEntity;

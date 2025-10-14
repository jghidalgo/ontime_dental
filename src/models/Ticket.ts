import mongoose, { Document, Model, Schema } from 'mongoose';

export type TicketStatus = 'Open' | 'In Progress' | 'Scheduled' | 'Resolved';
export type TicketPriority = 'Low' | 'Medium' | 'High';

export interface ITicketUpdate {
  timestamp: string;
  message: string;
  user: string;
}

export interface ITicket extends Document {
  subject: string;
  requester: string;
  location: string;
  channel: string;
  category: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  dueDate: string;
  updates: ITicketUpdate[];
  satisfaction?: string;
}

const TicketUpdateSchema = new Schema<ITicketUpdate>(
  {
    timestamp: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    user: {
      type: String,
      required: true
    }
  },
  { _id: false }
);

const TicketSchema = new Schema<ITicket>(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },
    requester: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    channel: {
      type: String,
      required: true,
      enum: ['Portal', 'Email', 'Phone', 'Chat', 'In Person'],
      default: 'Portal'
    },
    category: {
      type: String,
      required: true,
      enum: ['IT Support', 'Equipment', 'Facilities', 'Supplies', 'Patient Care', 'Training', 'Other'],
      default: 'IT Support'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'In Progress', 'Scheduled', 'Resolved'],
      default: 'Open'
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium'
    },
    createdAt: {
      type: String,
      required: true
    },
    dueDate: {
      type: String,
      required: true
    },
    updates: {
      type: [TicketUpdateSchema],
      default: []
    },
    satisfaction: {
      type: String,
      enum: ['Satisfied', 'Neutral', 'Unsatisfied', ''],
      default: ''
    }
  },
  {
    timestamps: false  // We'll manage createdAt manually
  }
);

// Indexes for common queries
TicketSchema.index({ status: 1, priority: -1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ location: 1 });
TicketSchema.index({ category: 1 });

const Ticket: Model<ITicket> =
  mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema);

export default Ticket;

import mongoose, { Document, Schema } from 'mongoose';

export interface ILog extends Document {
  timestamp: Date;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  ipAddress: string;
  userAgent: string;
  requestBody?: any;
  responseBody?: any;
  userId?: string;
  email?: string;
  error?: string;
  userEmail?: string;
}

const LogSchema = new Schema<ILog>({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  },
  url: {
    type: String,
    required: true
  },
  statusCode: {
    type: Number,
    required: true
  },
  responseTime: {
    type: Number,
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    default: ''
  },
  requestBody: {
    type: Schema.Types.Mixed
  },
  responseBody: {
    type: Schema.Types.Mixed
  },
  userId: {
    type: String
  },
  email: {
    type: String
  },
  error: {
    type: String
  },
  userEmail: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
LogSchema.index({ timestamp: -1 });
LogSchema.index({ method: 1, url: 1 });
LogSchema.index({ statusCode: 1 });
LogSchema.index({ email: 1 });

export default mongoose.model<ILog>('Log', LogSchema);

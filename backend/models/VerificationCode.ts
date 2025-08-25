import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationCode extends Document {
  email: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
  isUsed: boolean;
}

const verificationCodeSchema = new Schema<IVerificationCode>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
    length: 6,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
});

// Index for efficient queries and automatic cleanup
verificationCodeSchema.index({ email: 1, createdAt: -1 });
verificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup

export default mongoose.model<IVerificationCode>('VerificationCode', verificationCodeSchema);

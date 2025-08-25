import mongoose, { Document, Schema } from 'mongoose';

export interface IPasskey extends Document {
  email: string;
  credentialId: string;
  createdAt: Date;
  deviceInfo: {
    platform: string;
    deviceId?: string;
    deviceName?: string;
  };
  isActive: boolean;
  lastUsed?: Date;
}

const passkeySchema = new Schema<IPasskey>({
  email: {
    type: String,
    required: true,
    index: true,
  },
  credentialId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deviceInfo: {
    platform: {
      type: String,
      required: true,
    },
    deviceId: String,
    deviceName: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastUsed: {
    type: Date,
  },
});

// Index for efficient queries
passkeySchema.index({ email: 1, isActive: 1 });
passkeySchema.index({ credentialId: 1, isActive: 1 });

export default mongoose.model<IPasskey>('Passkey', passkeySchema);

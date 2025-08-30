import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  lastLogin?: Date;
  hasPasskey: boolean;
  hasPassword: boolean;
  password?: string;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    trim: true,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
  },
  hasPasskey: {
    type: Boolean,
    default: false,
  },
  hasPassword: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    // Hashed password for authentication
  },
});

// Index for efficient queries
userSchema.index({ email: 1, isEmailVerified: 1 });

export default mongoose.model<IUser>('User', userSchema);

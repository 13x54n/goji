import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  id: string;
  state: 'LIVE' | 'PENDING' | 'SUSPENDED';
  walletSetId: string;
  custodyType: 'DEVELOPER' | 'END_USER';
  address: string;
  blockchain: string;
  accountType: 'SCA' | 'EOA';
  updateDate: Date;
  createDate: Date;
  userId: mongoose.Types.ObjectId;
}

const walletSchema = new Schema<IWallet>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  state: {
    type: String,
    enum: ['LIVE', 'PENDING', 'SUSPENDED'],
    required: true,
    default: 'PENDING',
  },
  walletSetId: {
    type: String,
    required: true,
  },
  custodyType: {
    type: String,
    enum: ['DEVELOPER', 'END_USER'],
    required: true,
  },
  address: {
    type: String,
    required: true,
    unique: true,
  },
  blockchain: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    enum: ['SCA', 'EOA'],
    required: true,
  },
  updateDate: {
    type: Date,
    default: Date.now,
  },
  createDate: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

// Indexes for efficient queries
walletSchema.index({ userId: 1 });
// address index is automatically created by unique: true constraint
walletSchema.index({ blockchain: 1 });
walletSchema.index({ state: 1 });

export default mongoose.model<IWallet>('Wallet', walletSchema);
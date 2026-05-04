import mongoose, { Schema, Document } from 'mongoose';

export interface IBannedIP extends Document {
  ip: string;
  userAgent?: string;
  reason?: string;
  bannedAt: Date;
}

const BannedIPSchema = new Schema<IBannedIP>({
  ip: { type: String, required: true, unique: true },
  userAgent: { type: String },
  reason: { type: String },
  bannedAt: { type: Date, default: Date.now },
});

export default mongoose.models.BannedIP || mongoose.model<IBannedIP>('BannedIP', BannedIPSchema);

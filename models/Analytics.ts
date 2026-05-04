import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalytics extends Document {
  movieId: string;
  ip: string;
  userAgent?: string;
  watchedAt: Date;
  duration?: number;
}

const AnalyticsSchema = new Schema<IAnalytics>({
  movieId: { type: String, required: true, index: true },
  ip: { type: String, required: true },
  userAgent: { type: String },
  watchedAt: { type: Date, default: Date.now },
  duration: { type: Number },
});

export default mongoose.models.Analytics || mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);

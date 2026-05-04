import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  movieId: string;
  ip: string;
  score: number;
  createdAt: Date;
}

const RatingSchema = new Schema<IRating>({
  movieId: { type: String, required: true },
  ip: { type: String, required: true },
  score: { type: Number, required: true, min: 1, max: 5 },
}, { timestamps: true });

RatingSchema.index({ movieId: 1, ip: 1 }, { unique: true });

export default mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);

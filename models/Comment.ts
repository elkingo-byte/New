import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  movieId: string;
  guestName: string;
  content: string;
  ip?: string;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>({
  movieId: { type: String, required: true, index: true },
  guestName: { type: String, required: true, default: 'Anonymous' },
  content: { type: String, required: true, maxlength: 1000 },
  ip: { type: String },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

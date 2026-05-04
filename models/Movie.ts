import mongoose, { Schema, Document } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  titleAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  poster: string;
  backdrop: string;
  trailer?: string;
  videoUrl: string;
  videoQualities?: { label: string; url: string }[];
  imdbId?: string;
  imdbRating?: string;
  genre: string[];
  director?: string;
  cast?: string[];
  runtime?: string;
  year?: string;
  language?: string;
  country?: string;
  awards?: string;
  isPublished: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>({
  title: { type: String, required: true, trim: true },
  titleAr: { type: String, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  descriptionAr: { type: String },
  poster: { type: String, required: true },
  backdrop: { type: String, default: '' },
  trailer: { type: String },
  videoUrl: { type: String, required: true },
  videoQualities: [{ label: String, url: String }],
  imdbId: { type: String },
  imdbRating: { type: String },
  genre: [{ type: String }],
  director: { type: String },
  cast: [{ type: String }],
  runtime: { type: String },
  year: { type: String },
  language: { type: String },
  country: { type: String },
  awards: { type: String },
  isPublished: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
}, { timestamps: true });

MovieSchema.index({ title: 'text', description: 'text', genre: 1 });

export default mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);

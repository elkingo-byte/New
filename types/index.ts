export interface Movie {
  _id: string; title: string; titleAr?: string; slug: string;
  description: string; poster: string; backdrop: string; trailer?: string;
  videoUrl: string; videoQualities?: { label: string; url: string }[];
  imdbId?: string; imdbRating?: string; genre: string[]; director?: string;
  cast?: string[]; runtime?: string; year?: string; language?: string;
  country?: string; awards?: string; isPublished: boolean; views: number;
  createdAt: string; updatedAt: string;
}
export interface Comment { _id: string; movieId: string; guestName: string; content: string; createdAt: string; }
export interface Rating { average: string; count: number; }
export interface BannedIP { _id: string; ip: string; userAgent?: string; reason?: string; bannedAt: string; }
export interface AnalyticsStats { totalMovies: number; totalViews: number; activeToday: number; topMovies: { title: string; views: number; poster: string; slug: string }[]; }

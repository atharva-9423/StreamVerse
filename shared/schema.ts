import { pgTable, text, serial, integer, boolean, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  watchlist: text("watchlist").array(),
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  overview: text("overview").notNull(),
  posterPath: text("poster_path").notNull(),
  backdropPath: text("backdrop_path"),
  releaseYear: integer("release_year").notNull(),
  rating: text("rating").notNull(),
  matchPercentage: integer("match_percentage"),
  genres: text("genres").array(),
  type: text("type").notNull(), // 'movie' or 'anime'
  featured: boolean("featured").default(false),
  trending: boolean("trending").default(false),
  duration: integer("duration"), // Duration in seconds
});

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const watchHistory = pgTable("watch_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  watchedTime: integer("watched_time").notNull().default(0),
  totalTime: integer("total_time").notNull(),
  percentComplete: integer("percent_complete").notNull().default(0),
  lastWatched: timestamp("last_watched").notNull().defaultNow(),
  episode: text("episode"),
  season: text("season"),
  completed: boolean("completed").default(false),
});

export const downloadedContent = pgTable("downloaded_content", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  contentId: integer("content_id").notNull(),
  downloadDate: timestamp("download_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"), // When the download expires (optional)
  quality: text("quality").notNull(), // e.g., 'high', 'medium', 'low'
  downloadStatus: text("download_status").notNull(), // 'complete', 'in_progress', 'error'
  downloadProgress: integer("download_progress").default(0), // Percentage complete
  localPath: text("local_path"), // Location in IndexedDB/Cache API
  size: integer("size"), // Size in bytes
});

export const episodes = pgTable("episodes", {
  id: serial("id").primaryKey(),
  animeId: integer("anime_id").notNull(), // Reference to the parent anime content
  title: text("title").notNull(),
  episodeNumber: integer("episode_number").notNull(),
  seasonNumber: integer("season_number").notNull().default(1),
  thumbnail: text("thumbnail").notNull(),
  duration: integer("duration").notNull(), // Duration in seconds
  overview: text("overview"),
  releaseDate: timestamp("release_date").notNull().defaultNow(),
  videoUrl: text("video_url"), // URL to the episode video
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  watchlist: true
}).extend({
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true
});

export const insertGenreSchema = createInsertSchema(genres).omit({
  id: true
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({
  id: true,
  lastWatched: true
});

export const insertDownloadedContentSchema = createInsertSchema(downloadedContent).omit({
  id: true,
  downloadDate: true
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  releaseDate: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export type InsertGenre = z.infer<typeof insertGenreSchema>;
export type Genre = typeof genres.$inferSelect;

export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistory.$inferSelect;

export type InsertDownloadedContent = z.infer<typeof insertDownloadedContentSchema>;
export type DownloadedContent = typeof downloadedContent.$inferSelect;

export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodes.$inferSelect;

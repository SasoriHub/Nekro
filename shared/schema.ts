import { sql } from "drizzle-orm";
import {
  pgTable,
  text,
  varchar,
  integer,
  timestamp,
  boolean,
  jsonb,
  index,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Content types enum
export const contentTypes = ["anime", "manga", "manhwa"] as const;
export type ContentType = (typeof contentTypes)[number];

// Status types
export const statusTypes = ["ongoing", "completed", "upcoming", "hiatus"] as const;
export type StatusType = (typeof statusTypes)[number];

// Anime/Manga/Manhwa content table
export const content = pgTable("content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: varchar("type", { length: 20 }).notNull(), // anime, manga, manhwa
  title: text("title").notNull(),
  titleOriginal: text("title_original"),
  description: text("description"),
  posterUrl: text("poster_url"),
  backdropUrl: text("backdrop_url"),
  year: integer("year"),
  status: varchar("status", { length: 20 }).default("ongoing"), // ongoing, completed, upcoming
  rating: real("rating").default(0),
  ratingCount: integer("rating_count").default(0),
  genres: text("genres").array(),
  episodeCount: integer("episode_count").default(0),
  chapterCount: integer("chapter_count").default(0),
  duration: integer("duration"), // minutes per episode
  studio: varchar("studio", { length: 100 }),
  author: varchar("author", { length: 100 }),
  isFeatured: boolean("is_featured").default(false),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

// Episodes table (for anime)
export const episodes = pgTable("episodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => content.id),
  number: integer("number").notNull(),
  title: text("title"),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"),
  duration: integer("duration"), // seconds
  openingStart: integer("opening_start"), // seconds
  openingEnd: integer("opening_end"),
  endingStart: integer("ending_start"),
  endingEnd: integer("ending_end"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEpisodeSchema = createInsertSchema(episodes).omit({
  id: true,
  createdAt: true,
});

export type InsertEpisode = z.infer<typeof insertEpisodeSchema>;
export type Episode = typeof episodes.$inferSelect;

// Chapters table (for manga/manhwa)
export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => content.id),
  number: integer("number").notNull(),
  title: text("title"),
  pages: text("pages").array(), // array of image URLs
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
});

export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

// User favorites
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentId: varchar("content_id").notNull().references(() => content.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Watch history for anime
export const watchHistory = pgTable("watch_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentId: varchar("content_id").notNull().references(() => content.id),
  episodeId: varchar("episode_id").references(() => episodes.id),
  chapterId: varchar("chapter_id").references(() => chapters.id),
  progress: integer("progress").default(0), // seconds watched or page number
  duration: integer("duration").default(0), // total seconds or pages
  completed: boolean("completed").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({
  id: true,
});

export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistory.$inferSelect;

// Ratings
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentId: varchar("content_id").notNull().references(() => content.id),
  score: integer("score").notNull(), // 1-10
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

// Comments
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentId: varchar("content_id").notNull().references(() => content.id),
  parentId: varchar("parent_id"), // for nested comments
  text: text("text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Extended types for frontend with relations
export type ContentWithEpisodes = Content & {
  episodes?: Episode[];
  chapters?: Chapter[];
};

export type CommentWithUser = Comment & {
  user: User;
  replies?: CommentWithUser[];
};

export type WatchHistoryWithContent = WatchHistory & {
  content: Content;
  episode?: Episode;
  chapter?: Chapter;
};

export type FavoriteWithContent = Favorite & {
  content: Content;
};

// User preferences for recommendations and privacy
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  preferredGenres: text("preferred_genres").array(),
  preferredTypes: text("preferred_types").array(),
  hiddenMode: boolean("hidden_mode").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  pushNotifications: boolean("push_notifications").default(true),
  autoplayNext: boolean("autoplay_next").default(true),
  defaultQuality: varchar("default_quality", { length: 10 }).default("auto"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;

// Notifications
export const notificationTypes = ["new_episode", "series_completed", "recommendation", "system"] as const;
export type NotificationType = (typeof notificationTypes)[number];

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 30 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  contentId: varchar("content_id").references(() => content.id),
  episodeId: varchar("episode_id").references(() => episodes.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Activity timeline
export const activityTypes = ["watched", "rated", "favorited", "commented", "started_watching"] as const;
export type ActivityType = (typeof activityTypes)[number];

export const activityTimeline = pgTable("activity_timeline", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type", { length: 30 }).notNull(),
  contentId: varchar("content_id").references(() => content.id),
  episodeId: varchar("episode_id").references(() => episodes.id),
  metadata: jsonb("metadata"),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activityTimeline).omit({
  id: true,
  createdAt: true,
});

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activityTimeline.$inferSelect;

// Recommendations
export const recommendations = pgTable("recommendations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  contentId: varchar("content_id").notNull().references(() => content.id),
  score: real("score").default(0),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

// Anime sources (for external API integration)
export const animeSources = pgTable("anime_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contentId: varchar("content_id").notNull().references(() => content.id),
  episodeId: varchar("episode_id").references(() => episodes.id),
  sourceName: varchar("source_name", { length: 50 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  quality: varchar("quality", { length: 20 }),
  audioLang: varchar("audio_lang", { length: 10 }),
  subtitleLang: varchar("subtitle_lang", { length: 10 }),
  isHls: boolean("is_hls").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnimeSourceSchema = createInsertSchema(animeSources).omit({
  id: true,
  createdAt: true,
});

export type InsertAnimeSource = z.infer<typeof insertAnimeSourceSchema>;
export type AnimeSource = typeof animeSources.$inferSelect;

// Extended types
export type NotificationWithContent = Notification & {
  content?: Content;
  episode?: Episode;
};

export type ActivityWithContent = Activity & {
  content?: Content;
  episode?: Episode;
};

export type RecommendationWithContent = Recommendation & {
  content: Content;
};

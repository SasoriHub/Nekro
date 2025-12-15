import { eq, and, desc, asc, ilike, or, sql, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  content,
  episodes,
  chapters,
  favorites,
  watchHistory,
  ratings,
  comments,
  notifications,
  userPreferences,
  activityTimeline,
  recommendations,
  animeSources,
  type User,
  type UpsertUser,
  type Content,
  type InsertContent,
  type Episode,
  type InsertEpisode,
  type Chapter,
  type InsertChapter,
  type Favorite,
  type InsertFavorite,
  type WatchHistory,
  type InsertWatchHistory,
  type Rating,
  type InsertRating,
  type Comment,
  type InsertComment,
  type ContentWithEpisodes,
  type CommentWithUser,
  type WatchHistoryWithContent,
  type FavoriteWithContent,
  type Notification,
  type InsertNotification,
  type NotificationWithContent,
  type UserPreferences,
  type InsertUserPreferences,
  type Activity,
  type InsertActivity,
  type ActivityWithContent,
  type AnimeSource,
  type InsertAnimeSource,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Content
  getContent(id: string): Promise<ContentWithEpisodes | undefined>;
  getContentList(params: {
    type?: string;
    status?: string;
    year?: number;
    genres?: string[];
    sort?: string;
    limit?: number;
  }): Promise<Content[]>;
  getFeaturedContent(): Promise<Content[]>;
  getTrendingContent(): Promise<Content[]>;
  getNewContent(): Promise<Content[]>;
  getTopContent(type?: string): Promise<Content[]>;
  getOngoingContent(type?: string): Promise<Content[]>;
  getSimilarContent(contentId: string): Promise<Content[]>;
  searchContent(query: string): Promise<Content[]>;
  createContent(data: InsertContent): Promise<Content>;
  updateContentRating(contentId: string): Promise<void>;

  // Episodes
  getEpisode(id: string): Promise<Episode | undefined>;
  getEpisodesByContent(contentId: string): Promise<Episode[]>;
  createEpisode(data: InsertEpisode): Promise<Episode>;

  // Chapters
  getChapter(id: string): Promise<Chapter | undefined>;
  getChaptersByContent(contentId: string): Promise<Chapter[]>;
  createChapter(data: InsertChapter): Promise<Chapter>;

  // Favorites
  isFavorite(userId: string, contentId: string): Promise<boolean>;
  addFavorite(data: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, contentId: string): Promise<void>;
  getUserFavorites(userId: string): Promise<FavoriteWithContent[]>;

  // Watch History
  getWatchHistory(
    userId: string,
    contentId: string,
    episodeId?: string
  ): Promise<WatchHistory | null>;
  upsertWatchHistory(data: InsertWatchHistory): Promise<WatchHistory>;
  getUserHistory(userId: string): Promise<WatchHistoryWithContent[]>;

  // Ratings
  getUserRating(userId: string, contentId: string): Promise<Rating | null>;
  upsertRating(data: InsertRating): Promise<Rating>;

  // Comments
  getContentComments(contentId: string): Promise<CommentWithUser[]>;
  createComment(data: InsertComment): Promise<Comment>;
  deleteComment(id: string, userId: string): Promise<void>;

  // Notifications
  getUserNotifications(userId: string): Promise<NotificationWithContent[]>;
  createNotification(data: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string, userId: string): Promise<void>;
  markAllNotificationsRead(userId: string): Promise<void>;
  deleteNotification(id: string, userId: string): Promise<void>;

  // User Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
  upsertUserPreferences(data: InsertUserPreferences): Promise<UserPreferences>;

  // Activity Timeline
  getUserActivity(userId: string, showPrivate?: boolean, limit?: number): Promise<ActivityWithContent[]>;
  createActivity(data: InsertActivity): Promise<Activity>;

  // Anime Sources
  getAnimeSources(episodeId: string): Promise<AnimeSource[]>;
  createAnimeSource(data: InsertAnimeSource): Promise<AnimeSource>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Content
  async getContent(id: string): Promise<ContentWithEpisodes | undefined> {
    const [item] = await db.select().from(content).where(eq(content.id, id));
    if (!item) return undefined;

    const eps = await this.getEpisodesByContent(id);
    const chaps = await this.getChaptersByContent(id);

    return {
      ...item,
      episodes: eps,
      chapters: chaps,
    };
  }

  async getContentList(params: {
    type?: string;
    status?: string;
    year?: number;
    genres?: string[];
    sort?: string;
    limit?: number;
  }): Promise<Content[]> {
    let query = db.select().from(content);

    const conditions = [];
    if (params.type) {
      conditions.push(eq(content.type, params.type));
    }
    if (params.status) {
      conditions.push(eq(content.status, params.status));
    }
    if (params.year) {
      conditions.push(eq(content.year, params.year));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    let orderBy;
    switch (params.sort) {
      case "year":
        orderBy = desc(content.year);
        break;
      case "title":
        orderBy = asc(content.title);
        break;
      case "views":
        orderBy = desc(content.viewCount);
        break;
      case "rating":
      default:
        orderBy = desc(content.rating);
    }

    return query.orderBy(orderBy).limit(params.limit || 50);
  }

  async getFeaturedContent(): Promise<Content[]> {
    return db
      .select()
      .from(content)
      .where(eq(content.isFeatured, true))
      .orderBy(desc(content.rating))
      .limit(5);
  }

  async getTrendingContent(): Promise<Content[]> {
    return db
      .select()
      .from(content)
      .orderBy(desc(content.viewCount))
      .limit(12);
  }

  async getNewContent(): Promise<Content[]> {
    return db
      .select()
      .from(content)
      .orderBy(desc(content.createdAt))
      .limit(12);
  }

  async getTopContent(type?: string): Promise<Content[]> {
    let query = db.select().from(content);
    if (type) {
      query = query.where(eq(content.type, type)) as any;
    }
    return query.orderBy(desc(content.rating)).limit(50);
  }

  async getOngoingContent(type?: string): Promise<Content[]> {
    let query = db.select().from(content).where(eq(content.status, "ongoing"));
    if (type) {
      query = query.where(and(eq(content.status, "ongoing"), eq(content.type, type))) as any;
    }
    return query.orderBy(desc(content.updatedAt)).limit(50);
  }

  async getSimilarContent(contentId: string): Promise<Content[]> {
    const [item] = await db
      .select()
      .from(content)
      .where(eq(content.id, contentId));
    if (!item) return [];

    return db
      .select()
      .from(content)
      .where(
        and(
          eq(content.type, item.type),
          sql`${content.id} != ${contentId}`
        )
      )
      .orderBy(desc(content.rating))
      .limit(6);
  }

  async searchContent(query: string): Promise<Content[]> {
    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(content)
      .where(
        or(
          ilike(content.title, searchPattern),
          ilike(content.titleOriginal, searchPattern),
          ilike(content.description, searchPattern)
        )
      )
      .orderBy(desc(content.rating))
      .limit(50);
  }

  async createContent(data: InsertContent): Promise<Content> {
    const [item] = await db.insert(content).values(data).returning();
    return item;
  }

  async updateContentRating(contentId: string): Promise<void> {
    const result = await db
      .select({
        avgRating: sql<number>`AVG(${ratings.score})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.contentId, contentId));

    if (result[0]) {
      await db
        .update(content)
        .set({
          rating: result[0].avgRating || 0,
          ratingCount: result[0].count || 0,
          updatedAt: new Date(),
        })
        .where(eq(content.id, contentId));
    }
  }

  // Episodes
  async getEpisode(id: string): Promise<Episode | undefined> {
    const [episode] = await db
      .select()
      .from(episodes)
      .where(eq(episodes.id, id));
    return episode;
  }

  async getEpisodesByContent(contentId: string): Promise<Episode[]> {
    return db
      .select()
      .from(episodes)
      .where(eq(episodes.contentId, contentId))
      .orderBy(asc(episodes.number));
  }

  async createEpisode(data: InsertEpisode): Promise<Episode> {
    const [episode] = await db.insert(episodes).values(data).returning();
    return episode;
  }

  // Chapters
  async getChapter(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db
      .select()
      .from(chapters)
      .where(eq(chapters.id, id));
    return chapter;
  }

  async getChaptersByContent(contentId: string): Promise<Chapter[]> {
    return db
      .select()
      .from(chapters)
      .where(eq(chapters.contentId, contentId))
      .orderBy(asc(chapters.number));
  }

  async createChapter(data: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(data).returning();
    return chapter;
  }

  // Favorites
  async isFavorite(userId: string, contentId: string): Promise<boolean> {
    const [fav] = await db
      .select()
      .from(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.contentId, contentId))
      );
    return !!fav;
  }

  async addFavorite(data: InsertFavorite): Promise<Favorite> {
    const [fav] = await db.insert(favorites).values(data).returning();
    return fav;
  }

  async removeFavorite(userId: string, contentId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(
        and(eq(favorites.userId, userId), eq(favorites.contentId, contentId))
      );
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithContent[]> {
    const favs = await db
      .select()
      .from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt));

    const contentIds = favs.map((f) => f.contentId);
    if (contentIds.length === 0) return [];

    const contents = await db
      .select()
      .from(content)
      .where(inArray(content.id, contentIds));

    const contentMap = new Map(contents.map((c) => [c.id, c]));

    return favs
      .map((f) => ({
        ...f,
        content: contentMap.get(f.contentId)!,
      }))
      .filter((f) => f.content);
  }

  // Watch History
  async getWatchHistory(
    userId: string,
    contentId: string,
    episodeId?: string
  ): Promise<WatchHistory | null> {
    const conditions = [
      eq(watchHistory.userId, userId),
      eq(watchHistory.contentId, contentId),
    ];
    if (episodeId) {
      conditions.push(eq(watchHistory.episodeId, episodeId));
    }

    const [history] = await db
      .select()
      .from(watchHistory)
      .where(and(...conditions));
    return history || null;
  }

  async upsertWatchHistory(data: InsertWatchHistory): Promise<WatchHistory> {
    const existing = await this.getWatchHistory(
      data.userId,
      data.contentId,
      data.episodeId || undefined
    );

    if (existing) {
      const [updated] = await db
        .update(watchHistory)
        .set({
          progress: data.progress,
          duration: data.duration,
          completed: data.completed,
          updatedAt: new Date(),
        })
        .where(eq(watchHistory.id, existing.id))
        .returning();
      return updated;
    }

    const [history] = await db
      .insert(watchHistory)
      .values({
        ...data,
        updatedAt: new Date(),
      })
      .returning();
    return history;
  }

  async getUserHistory(userId: string): Promise<WatchHistoryWithContent[]> {
    const historyItems = await db
      .select()
      .from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.updatedAt))
      .limit(50);

    if (historyItems.length === 0) return [];

    const contentIds = [...new Set(historyItems.map((h) => h.contentId))];
    const episodeIds = historyItems
      .filter((h) => h.episodeId)
      .map((h) => h.episodeId!);

    const contents = await db
      .select()
      .from(content)
      .where(inArray(content.id, contentIds));

    const eps =
      episodeIds.length > 0
        ? await db
            .select()
            .from(episodes)
            .where(inArray(episodes.id, episodeIds))
        : [];

    const contentMap = new Map(contents.map((c) => [c.id, c]));
    const episodeMap = new Map(eps.map((e) => [e.id, e]));

    return historyItems
      .map((h) => ({
        ...h,
        content: contentMap.get(h.contentId)!,
        episode: h.episodeId ? episodeMap.get(h.episodeId) : undefined,
      }))
      .filter((h) => h.content);
  }

  // Ratings
  async getUserRating(
    userId: string,
    contentId: string
  ): Promise<Rating | null> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(and(eq(ratings.userId, userId), eq(ratings.contentId, contentId)));
    return rating || null;
  }

  async upsertRating(data: InsertRating): Promise<Rating> {
    const existing = await this.getUserRating(data.userId, data.contentId);

    if (existing) {
      const [updated] = await db
        .update(ratings)
        .set({
          score: data.score,
          updatedAt: new Date(),
        })
        .where(eq(ratings.id, existing.id))
        .returning();
      await this.updateContentRating(data.contentId);
      return updated;
    }

    const [rating] = await db.insert(ratings).values(data).returning();
    await this.updateContentRating(data.contentId);
    return rating;
  }

  // Comments
  async getContentComments(contentId: string): Promise<CommentWithUser[]> {
    const allComments = await db
      .select()
      .from(comments)
      .where(eq(comments.contentId, contentId))
      .orderBy(desc(comments.createdAt));

    if (allComments.length === 0) return [];

    const userIds = [...new Set(allComments.map((c) => c.userId))];
    const commentUsers = await db
      .select()
      .from(users)
      .where(inArray(users.id, userIds));

    const userMap = new Map(commentUsers.map((u) => [u.id, u]));

    return allComments.map((c) => ({
      ...c,
      user: userMap.get(c.userId) || {
        id: c.userId,
        email: null,
        firstName: "Пользователь",
        lastName: null,
        profileImageUrl: null,
        createdAt: null,
        updatedAt: null,
      },
    }));
  }

  async createComment(data: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(data).returning();
    return comment;
  }

  async deleteComment(id: string, userId: string): Promise<void> {
    await db
      .delete(comments)
      .where(and(eq(comments.id, id), eq(comments.userId, userId)));
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<NotificationWithContent[]> {
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    if (notifs.length === 0) return [];

    const contentIds = notifs.filter(n => n.contentId).map(n => n.contentId!);
    const episodeIds = notifs.filter(n => n.episodeId).map(n => n.episodeId!);

    const contents = contentIds.length > 0
      ? await db.select().from(content).where(inArray(content.id, contentIds))
      : [];
    const eps = episodeIds.length > 0
      ? await db.select().from(episodes).where(inArray(episodes.id, episodeIds))
      : [];

    const contentMap = new Map(contents.map(c => [c.id, c]));
    const episodeMap = new Map(eps.map(e => [e.id, e]));

    return notifs.map(n => ({
      ...n,
      content: n.contentId ? contentMap.get(n.contentId) : undefined,
      episode: n.episodeId ? episodeMap.get(n.episodeId) : undefined,
    }));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(data).returning();
    return notif;
  }

  async markNotificationRead(id: string, userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
  }

  // User Preferences
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const [prefs] = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));
    return prefs || null;
  }

  async upsertUserPreferences(data: InsertUserPreferences): Promise<UserPreferences> {
    const existing = await this.getUserPreferences(data.userId);

    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.id, existing.id))
        .returning();
      return updated;
    }

    const [prefs] = await db.insert(userPreferences).values(data).returning();
    return prefs;
  }

  // Activity Timeline
  async getUserActivity(userId: string, showPrivate = false, limit = 20): Promise<ActivityWithContent[]> {
    let query = db
      .select()
      .from(activityTimeline)
      .where(eq(activityTimeline.userId, userId));

    if (!showPrivate) {
      query = db
        .select()
        .from(activityTimeline)
        .where(and(eq(activityTimeline.userId, userId), eq(activityTimeline.isPrivate, false)));
    }

    const activities = await query
      .orderBy(desc(activityTimeline.createdAt))
      .limit(limit);

    if (activities.length === 0) return [];

    const contentIds = activities.filter(a => a.contentId).map(a => a.contentId!);
    const episodeIds = activities.filter(a => a.episodeId).map(a => a.episodeId!);

    const contents = contentIds.length > 0
      ? await db.select().from(content).where(inArray(content.id, contentIds))
      : [];
    const eps = episodeIds.length > 0
      ? await db.select().from(episodes).where(inArray(episodes.id, episodeIds))
      : [];

    const contentMap = new Map(contents.map(c => [c.id, c]));
    const episodeMap = new Map(eps.map(e => [e.id, e]));

    return activities.map(a => ({
      ...a,
      content: a.contentId ? contentMap.get(a.contentId) : undefined,
      episode: a.episodeId ? episodeMap.get(a.episodeId) : undefined,
    }));
  }

  async createActivity(data: InsertActivity): Promise<Activity> {
    const prefs = await this.getUserPreferences(data.userId);
    const isPrivate = prefs?.hiddenMode || data.isPrivate;

    const [activity] = await db
      .insert(activityTimeline)
      .values({ ...data, isPrivate })
      .returning();
    return activity;
  }

  // Anime Sources
  async getAnimeSources(episodeId: string): Promise<AnimeSource[]> {
    return db
      .select()
      .from(animeSources)
      .where(eq(animeSources.episodeId, episodeId));
  }

  async createAnimeSource(data: InsertAnimeSource): Promise<AnimeSource> {
    const [source] = await db.insert(animeSources).values(data).returning();
    return source;
  }
}

export const storage = new DatabaseStorage();

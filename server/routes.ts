import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, optionalAuth } from "./auth";
import { insertCommentSchema, insertRatingSchema } from "@shared/schema";
import { z } from "zod";
import { generateRecommendations } from "./recommendations";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Content endpoints
  app.get("/api/content/featured", async (req, res) => {
    try {
      const items = await storage.getFeaturedContent();
      res.json(items);
    } catch (err) {
      console.error("Error fetching featured content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/trending", async (req, res) => {
    try {
      const items = await storage.getTrendingContent();
      res.json(items);
    } catch (err) {
      console.error("Error fetching trending content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/new", async (req, res) => {
    try {
      const items = await storage.getNewContent();
      res.json(items);
    } catch (err) {
      console.error("Error fetching new content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/top", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const items = await storage.getTopContent(type);
      res.json(items);
    } catch (err) {
      console.error("Error fetching top content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/ongoing", async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const items = await storage.getOngoingContent(type);
      res.json(items);
    } catch (err) {
      console.error("Error fetching ongoing content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content", async (req, res) => {
    try {
      const { type, status, year, genres, sort, limit } = req.query;
      const items = await storage.getContentList({
        type: type as string | undefined,
        status: status as string | undefined,
        year: year ? parseInt(year as string) : undefined,
        genres: genres ? (genres as string).split(",") : undefined,
        sort: sort as string | undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });
      res.json(items);
    } catch (err) {
      console.error("Error fetching content list:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const item = await storage.getContent(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(item);
    } catch (err) {
      console.error("Error fetching content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/content/:id/similar", async (req, res) => {
    try {
      const items = await storage.getSimilarContent(req.params.id);
      res.json(items);
    } catch (err) {
      console.error("Error fetching similar content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Comments
  app.get("/api/content/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getContentComments(req.params.id);
      res.json(comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/content/:id/comments", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contentId = req.params.id;
      const { text, parentId } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ message: "Comment text is required" });
      }

      const comment = await storage.createComment({
        userId,
        contentId,
        text: text.trim(),
        parentId: parentId || null,
      });

      res.status(201).json(comment);
    } catch (err) {
      console.error("Error creating comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/comments/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.deleteComment(req.params.id, userId);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting comment:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Ratings
  app.get("/api/content/:id/rating", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const rating = await storage.getUserRating(userId, req.params.id);
      res.json(rating);
    } catch (err) {
      console.error("Error fetching rating:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/content/:id/rate", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const contentId = req.params.id;
      const { score } = req.body;

      if (typeof score !== "number" || score < 1 || score > 10) {
        return res
          .status(400)
          .json({ message: "Score must be between 1 and 10" });
      }

      const rating = await storage.upsertRating({
        userId,
        contentId,
        score,
      });

      res.json(rating);
    } catch (err) {
      console.error("Error rating content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Favorites
  app.get("/api/favorites/:contentId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const isFav = await storage.isFavorite(userId, req.params.contentId);
      res.json(isFav);
    } catch (err) {
      console.error("Error checking favorite:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { contentId } = req.body;

      if (!contentId) {
        return res.status(400).json({ message: "Content ID is required" });
      }

      const favorite = await storage.addFavorite({
        userId,
        contentId,
      });

      res.status(201).json(favorite);
    } catch (err) {
      console.error("Error adding favorite:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/favorites/:contentId", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.removeFavorite(userId, req.params.contentId);
      res.status(204).send();
    } catch (err) {
      console.error("Error removing favorite:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Watch History
  app.get("/api/history/:contentId/:episodeId?", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { contentId, episodeId } = req.params;
      const history = await storage.getWatchHistory(userId, contentId, episodeId);
      res.json(history);
    } catch (err) {
      console.error("Error fetching watch history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { contentId, episodeId, chapterId, progress, duration, completed } =
        req.body;

      const history = await storage.upsertWatchHistory({
        userId,
        contentId,
        episodeId: episodeId || null,
        chapterId: chapterId || null,
        progress: progress || 0,
        duration: duration || 0,
        completed: completed || false,
      });

      res.json(history);
    } catch (err) {
      console.error("Error updating watch history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User endpoints
  app.get("/api/user/favorites", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (err) {
      console.error("Error fetching user favorites:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user/history", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const history = await storage.getUserHistory(userId);
      res.json(history);
    } catch (err) {
      console.error("Error fetching user history:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.json([]);
      }
      const results = await storage.searchContent(query);
      res.json(results);
    } catch (err) {
      console.error("Error searching content:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notifications
  app.get("/api/user/notifications", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/notifications/:id/read", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.markNotificationRead(req.params.id, userId);
      res.status(204).send();
    } catch (err) {
      console.error("Error marking notification read:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsRead(userId);
      res.status(204).send();
    } catch (err) {
      console.error("Error marking all notifications read:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/notifications/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.deleteNotification(req.params.id, userId);
      res.status(204).send();
    } catch (err) {
      console.error("Error deleting notification:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Preferences
  app.get("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const prefs = await storage.getUserPreferences(userId);
      res.json(prefs || {
        hiddenMode: false,
        emailNotifications: true,
        pushNotifications: true,
        autoplayNext: true,
        defaultQuality: "auto",
      });
    } catch (err) {
      console.error("Error fetching preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/user/preferences", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const prefs = await storage.upsertUserPreferences({
        userId,
        ...req.body,
      });
      res.json(prefs);
    } catch (err) {
      console.error("Error updating preferences:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity Timeline
  app.get("/api/user/activity", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const showPrivate = req.query.showPrivate === "true";
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await storage.getUserActivity(userId, showPrivate, limit);
      res.json(activities);
    } catch (err) {
      console.error("Error fetching activity:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Recommendations
  app.get("/api/recommendations", isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const recs = await generateRecommendations(userId);
      res.json(recs);
    } catch (err) {
      console.error("Error generating recommendations:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Episode sources
  app.get("/api/episodes/:id/sources", async (req, res) => {
    try {
      const sources = await storage.getAnimeSources(req.params.id);
      res.json(sources);
    } catch (err) {
      console.error("Error fetching episode sources:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}

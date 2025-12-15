import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string | null;
      firstName: string | null;
      lastName: string | null;
      profileImageUrl: string | null;
    }
  }
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const PgSession = connectPg(session);
  const sessionStore = new PgSession({
    pool: pool,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  return session({
    secret: process.env.SESSION_SECRET || "nekora-session-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (err) {
      done(err);
    }
  });

  // Replit Auth endpoints
  app.get("/api/login", (req, res) => {
    const replitAuthUrl = "https://replit.com/auth_with_repl_site?domain=" + req.headers.host;
    res.redirect(replitAuthUrl);
  });

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
      }
      res.redirect("/");
    });
  });

  // Handle Replit Auth callback
  app.get("/__replauthcallback", async (req, res) => {
    const replitUser = (req as any).headers["x-replit-user-id"];
    const replitName = (req as any).headers["x-replit-user-name"];
    const replitUrl = (req as any).headers["x-replit-user-url"];
    const replitProfileImage = (req as any).headers["x-replit-user-profile-image"];
    const replitRoles = (req as any).headers["x-replit-user-roles"];

    if (!replitUser) {
      return res.redirect("/");
    }

    try {
      const user = await storage.upsertUser({
        id: replitUser,
        email: `${replitName}@replit.users`,
        firstName: replitName,
        lastName: null,
        profileImageUrl: replitProfileImage || null,
      });

      req.login(
        {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.redirect("/");
          }
          res.redirect("/");
        }
      );
    } catch (err) {
      console.error("Auth callback error:", err);
      res.redirect("/");
    }
  });

  // Auth check endpoint
  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      return res.json(req.user);
    }
    return res.status(401).json({ message: "Unauthorized" });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "401: Unauthorized" });
};

export const optionalAuth: RequestHandler = (req, res, next) => {
  next();
};

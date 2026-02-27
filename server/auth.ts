import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import { pool } from "./db";
import connectPgSimple from "connect-pg-simple";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      password: string;
      role: string;
      isActive: boolean;
      createdAt: Date | null;
      lastLoginAt: Date | null;
    }
  }
}

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  return bcrypt.compare(supplied, stored);
}

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { ip: false },
});

export function setupAuth(app: Express): void {
  const PgStore = connectPgSimple(session);

  app.use(
    session({
      store: new PgStore({ pool, createTableIfMissing: true }),
      secret: process.env.SESSION_SECRET || "norwert-hills-funeral-session-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email.toLowerCase().trim());
          if (!user || !user.isActive) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const valid = await comparePasswords(password, user.password);
          if (!valid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          await storage.updateLastLogin(user.id);
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user || !user.isActive) return done(null, undefined);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/auth/login", loginLimiter, (req, res, next) => {
    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message: string }) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid email or password" });
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logged out" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user!;
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  });
}

export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  next();
};

export const requireDirector: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: "Authentication required" });
  if (req.user!.role !== "director") return res.status(403).json({ message: "Director access required" });
  next();
};

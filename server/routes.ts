import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authenticateToken, AuthRequest } from "./middleware/auth";
import { createUserWithOTP, verifyOTPAndCreateUser, loginUser } from "./services/auth";
import { 
  insertUserSchema, 
  loginSchema, 
  verifyOTPSchema, 
  insertNoteSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const result = await createUserWithOTP(validatedData);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.issues || [error.message] 
      });
    }
  });

  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, code, userData } = req.body;
      
      verifyOTPSchema.parse({ email, code });
      insertUserSchema.parse(userData);

      const result = await verifyOTPAndCreateUser(email, code, userData);
      
      if (result.success) {
        res.json({
          message: result.message,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.issues || [error.message] 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await loginUser(email, password);
      
      if (result.success) {
        res.json({
          message: result.message,
          token: result.token,
          user: result.user,
        });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.issues || [error.message] 
      });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // For resend, we need the user data again (stored in session or re-submitted)
      const result = await createUserWithOTP(req.body);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ message: result.message });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to resend OTP" });
    }
  });

  // Protected routes
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Notes routes
  app.get("/api/notes", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const notes = await storage.getUserNotes(req.user!.id);
      res.json(notes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post("/api/notes", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertNoteSchema.parse(req.body);
      const note = await storage.createNote({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(note);
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.issues || [error.message] 
      });
    }
  });

  app.put("/api/notes/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertNoteSchema.partial().parse(req.body);
      
      const note = await storage.updateNote(id, req.user!.id, validatedData);
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ 
        message: "Validation failed", 
        errors: error.issues || [error.message] 
      });
    }
  });

  app.delete("/api/notes/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteNote(id, req.user!.id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  app.get("/api/notes/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const note = await storage.getNote(id, req.user!.id);
      
      if (!note) {
        return res.status(404).json({ message: "Note not found" });
      }
      
      res.json(note);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch note" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

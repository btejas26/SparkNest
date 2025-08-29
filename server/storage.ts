import { users, notes, otpCodes, type User, type InsertUser, type Note, type InsertNote, type OTPCode, type InsertOTPCode } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserEmailVerification(email: string, isVerified: boolean): Promise<void>;

  // Note operations
  getUserNotes(userId: string): Promise<Note[]>;
  createNote(note: InsertNote & { userId: string }): Promise<Note>;
  updateNote(id: string, userId: string, updates: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string, userId: string): Promise<boolean>;
  getNote(id: string, userId: string): Promise<Note | undefined>;

  // OTP operations
  createOTP(otp: InsertOTPCode): Promise<OTPCode>;
  getValidOTP(email: string, code: string): Promise<OTPCode | undefined>;
  markOTPAsUsed(id: string): Promise<void>;
  cleanupExpiredOTPs(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        updatedAt: new Date()
      })
      .returning();
    return user;
  }

  async updateUserEmailVerification(email: string, isVerified: boolean): Promise<void> {
    await db
      .update(users)
      .set({ 
        isEmailVerified: isVerified,
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  }

  async getUserNotes(userId: string): Promise<Note[]> {
    return await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));
  }

  async createNote(note: InsertNote & { userId: string }): Promise<Note> {
    const [newNote] = await db
      .insert(notes)
      .values({
        ...note,
        updatedAt: new Date()
      })
      .returning();
    return newNote;
  }

  async updateNote(id: string, userId: string, updates: Partial<InsertNote>): Promise<Note | undefined> {
    const [updatedNote] = await db
      .update(notes)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(and(eq(notes.id, id), eq(notes.userId, userId)))
      .returning();
    return updatedNote || undefined;
  }

  async deleteNote(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async getNote(id: string, userId: string): Promise<Note | undefined> {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId)));
    return note || undefined;
  }

  async createOTP(otp: InsertOTPCode): Promise<OTPCode> {
    const [newOTP] = await db
      .insert(otpCodes)
      .values(otp)
      .returning();
    return newOTP;
  }

  async getValidOTP(email: string, code: string): Promise<OTPCode | undefined> {
    const [otp] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.email, email),
          eq(otpCodes.code, code),
          eq(otpCodes.isUsed, false)
        )
      );
    
    if (otp && otp.expiresAt > new Date()) {
      return otp;
    }
    return undefined;
  }

  async markOTPAsUsed(id: string): Promise<void> {
    await db
      .update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, id));
  }

  async cleanupExpiredOTPs(): Promise<void> {
    await db
      .delete(otpCodes)
      .where(sql`expires_at < NOW()`);
  }
}

export const storage = new DatabaseStorage();

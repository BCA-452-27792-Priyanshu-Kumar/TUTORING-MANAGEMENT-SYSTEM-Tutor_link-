import { db } from "./db";
import {
  users, tutors, bookings,
  type User, type InsertUser,
  type Tutor, type InsertTutor,
  type Booking, type InsertBooking
} from "@shared/schema";
import { eq, like, arrayContains, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // Tutor operations
  getTutorByUserId(userId: number): Promise<Tutor | undefined>;
  getTutor(id: number): Promise<(Tutor & { user: User }) | undefined>;
  getAllTutors(subject?: string): Promise<(Tutor & { user: User })[]>;
  createTutorProfile(tutor: InsertTutor & { userId: number }): Promise<Tutor>;
  updateTutorProfile(userId: number, tutor: InsertTutor): Promise<Tutor>;

  // Booking operations
  createBooking(booking: InsertBooking & { studentId: number }): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByStudent(studentId: number): Promise<(Booking & { tutor: Tutor & { user: User } })[]>;
  getBookingsByTutor(tutorId: number): Promise<(Booking & { student: User })[]>;
  getAllBookings(): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  
  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<void> {
    // Delete related data first to satisfy foreign keys
    // This is a simple implementation; in production, consider soft deletes or cascading in DB
    const userTutor = await this.getTutorByUserId(id);
    if (userTutor) {
      await db.delete(bookings).where(eq(bookings.tutorId, userTutor.id));
      await db.delete(tutors).where(eq(tutors.userId, id));
    }
    await db.delete(bookings).where(eq(bookings.studentId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  // Tutor methods
  async getTutorByUserId(userId: number): Promise<Tutor | undefined> {
    const [tutor] = await db.select().from(tutors).where(eq(tutors.userId, userId));
    return tutor;
  }

  async getTutor(id: number): Promise<(Tutor & { user: User }) | undefined> {
    const result = await db.select({
      tutor: tutors,
      user: users,
    })
    .from(tutors)
    .innerJoin(users, eq(tutors.userId, users.id))
    .where(eq(tutors.id, id));
    
    if (result.length === 0) return undefined;
    return { ...result[0].tutor, user: result[0].user };
  }

  async getAllTutors(subject?: string): Promise<(Tutor & { user: User })[]> {
    let query = db.select({
      tutor: tutors,
      user: users,
    })
    .from(tutors)
    .innerJoin(users, eq(tutors.userId, users.id));

    if (subject) {
      // Note: This is a simple array check. In production, standardized tags are better.
      // Drizzle doesn't have a direct 'array contains' for PG text[] in this version easily accessible via standard query builder without sql operator sometimes, 
      // but let's try a simple filter or fetch all and filter in memory if list is small, 
      // OR use proper SQL. Let's return all for now and handle filtering in route if needed, 
      // or assume simple 'like' search on serialized subjects if we stored them as string, but we stored as array.
      // For simplicity in this demo, we'll return all and filter in route or client if complex query needed.
      // BUT, let's try to implement strict subject filtering if we can.
    }

    const results = await query;
    const mapped = results.map(r => ({ ...r.tutor, user: r.user }));
    
    if (subject) {
      return mapped.filter(t => t.subjects.some(s => s.toLowerCase().includes(subject.toLowerCase())));
    }
    
    return mapped;
  }

  async createTutorProfile(tutor: InsertTutor & { userId: number }): Promise<Tutor> {
    const [newTutor] = await db.insert(tutors).values(tutor).returning();
    return newTutor;
  }

  async updateTutorProfile(userId: number, tutorUpdate: InsertTutor): Promise<Tutor> {
    const [updated] = await db.update(tutors)
      .set(tutorUpdate)
      .where(eq(tutors.userId, userId))
      .returning();
    return updated;
  }

  // Booking methods
  async createBooking(booking: InsertBooking & { studentId: number }): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByStudent(studentId: number): Promise<(Booking & { tutor: Tutor & { user: User } })[]> {
    const results = await db.select({
      booking: bookings,
      tutor: tutors,
      user: users
    })
    .from(bookings)
    .innerJoin(tutors, eq(bookings.tutorId, tutors.id))
    .innerJoin(users, eq(tutors.userId, users.id))
    .where(eq(bookings.studentId, studentId));

    return results.map(r => ({
      ...r.booking,
      tutor: { ...r.tutor, user: r.user }
    }));
  }

  async getBookingsByTutor(tutorId: number): Promise<(Booking & { student: User })[]> {
    const results = await db.select({
      booking: bookings,
      student: users
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.studentId, users.id))
    .where(eq(bookings.tutorId, tutorId));

    return results.map(r => ({
      ...r.booking,
      student: r.student
    }));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db.select().from(bookings);
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updated] = await db.update(bookings)
      .set({ status: status as any })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();

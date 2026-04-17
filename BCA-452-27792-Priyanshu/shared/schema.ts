import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "tutor", "admin"] }).notNull().default("student"),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  bio: text("bio").notNull(),
  subjects: text("subjects").array().notNull(), // Array of subjects e.g. ["Math", "Physics"]
  experience: integer("experience").notNull(), // Years of experience
  hourlyRate: integer("hourly_rate").notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => users.id).notNull(),
  tutorId: integer("tutor_id").references(() => tutors.id).notNull(),
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "accepted", "rejected", "completed"] }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  tutorProfile: one(tutors, {
    fields: [users.id],
    references: [tutors.userId],
  }),
  studentBookings: many(bookings, { relationName: "studentBookings" }),
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  user: one(users, {
    fields: [tutors.userId],
    references: [users.id],
  }),
  bookings: many(bookings, { relationName: "tutorBookings" }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  student: one(users, {
    fields: [bookings.studentId],
    references: [users.id],
    relationName: "studentBookings",
  }),
  tutor: one(tutors, {
    fields: [bookings.tutorId],
    references: [tutors.id],
    relationName: "tutorBookings",
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertTutorSchema = createInsertSchema(tutors).omit({ id: true, userId: true });
export const insertBookingSchema = createInsertSchema(bookings)
  .omit({ id: true, createdAt: true, status: true, studentId: true })
  .extend({ date: z.coerce.date() }); // Convert string to Date

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tutor = typeof tutors.$inferSelect;
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

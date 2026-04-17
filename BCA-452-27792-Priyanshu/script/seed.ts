
import { db } from "../server/db";
import { users, tutors, bookings } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function runSeed() {
  console.log("Seeding database...");

  // Clear existing data
  await db.delete(bookings);
  await db.delete(tutors);
  await db.delete(users);

  const password = await hashPassword("password123");

  // 1. Create Admin
  await db.insert(users).values({
    username: "admin",
    password,
    role: "admin",
    name: "System Admin",
  });

  // 2. Create Tutors
  const [tutorUser1] = await db.insert(users).values({
    username: "tutor1",
    password,
    role: "tutor",
    name: "John Doe",
  }).returning();

  const [tutorUser2] = await db.insert(users).values({
    username: "tutor2",
    password,
    role: "tutor",
    name: "Jane Smith",
  }).returning();

  // 3. Create Tutor Profiles
  await db.insert(tutors).values({
    userId: tutorUser1.id,
    bio: "Experienced Math tutor with 5 years of teaching.",
    subjects: ["Math", "Algebra", "Calculus"],
    experience: 5,
    hourlyRate: 600,
  });

  const [tutorProfile2] = await db.insert(tutors).values({
    userId: tutorUser2.id,
    bio: "Physics expert and science enthusiast.",
    subjects: ["Physics", "Science"],
    experience: 3,
    hourlyRate: 450,
  }).returning();

  // 4. Create Students
  const [studentUser] = await db.insert(users).values({
    username: "student1",
    password,
    role: "student",
    name: "Alice Student",
  }).returning();

  // 5. Create a Booking
  await db.insert(bookings).values({
    studentId: studentUser.id,
    tutorId: tutorProfile2.id,
    date: new Date(Date.now() + 86400000), // Tomorrow
    status: "pending",
    notes: "I need help with Physics homework.",
  });

  console.log("Seeding complete!");
}

runSeed().catch(console.error);

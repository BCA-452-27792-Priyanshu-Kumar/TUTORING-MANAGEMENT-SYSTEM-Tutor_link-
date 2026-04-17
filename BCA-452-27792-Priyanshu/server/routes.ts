import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

// Helper to omit password from user responses
function omitPassword(user: any) {
  const { password, ...rest } = user;
  return rest;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication (Passport, Sessions)
  setupAuth(app);

  // --- Tutors Routes ---
  
  app.get(api.tutors.list.path, async (req, res) => {
    const subject = req.query.subject as string | undefined;
    const tutors = await storage.getAllTutors(subject);
    res.json(tutors.map(t => ({ ...t, user: omitPassword(t.user) })));
  });

  app.get(api.tutors.get.path, async (req, res) => {
    const id = parseInt(req.params.id);
    const tutor = await storage.getTutor(id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.json({ ...tutor, user: omitPassword(tutor.user) });
  });

  app.put(api.tutors.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    // Ensure user is a tutor
    if (req.user!.role !== 'tutor') return res.status(403).json({ message: "Only tutors can update profile" });

    try {
      const input = api.tutors.update.input.parse(req.body);
      
      // Check if profile exists, if not create it
      const existing = await storage.getTutorByUserId(req.user!.id);
      let updated;
      
      if (existing) {
        updated = await storage.updateTutorProfile(req.user!.id, input);
      } else {
        updated = await storage.createTutorProfile({ ...input, userId: req.user!.id });
      }
      
      res.json(updated);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: e.errors });
      } else {
        throw e;
      }
    }
  });

  // --- Bookings Routes ---

  app.post(api.bookings.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (req.user!.role !== 'student') return res.status(403).json({ message: "Only students can book" });

    try {
      const input = api.bookings.create.input.parse(req.body);
      const booking = await storage.createBooking({ ...input, studentId: req.user!.id });
      res.status(201).json(booking);
    } catch (e) {
       if (e instanceof z.ZodError) {
        res.status(400).json({ message: "Validation error", details: e.errors });
      } else {
        throw e;
      }
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    if (req.user!.role === 'student') {
      const bookings = await storage.getBookingsByStudent(req.user!.id);
      return res.json(bookings.map(b => ({ ...b, tutor: { ...b.tutor, user: omitPassword(b.tutor.user) } })));
    } else if (req.user!.role === 'tutor') {
      // First get tutor ID from user ID
      const tutor = await storage.getTutorByUserId(req.user!.id);
      if (!tutor) return res.json([]); // No profile yet
      const bookings = await storage.getBookingsByTutor(tutor.id);
      return res.json(bookings.map(b => ({ ...b, student: omitPassword(b.student) })));
    } else if (req.user!.role === 'admin') {
      const bookings = await storage.getAllBookings();
      return res.json(bookings);
    }
    
    res.json([]);
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const id = parseInt(req.params.id);
    const status = req.body.status;
    
    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await storage.getBooking(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (req.user!.role === "admin") {
      const updated = await storage.updateBookingStatus(id, status);
      return res.json(updated);
    }

    if (req.user!.role === "tutor") {
      const tutor = await storage.getTutorByUserId(req.user!.id);
      if (!tutor || booking.tutorId !== tutor.id) {
        return res.status(403).json({ message: "Not authorized to update this booking" });
      }
      const updated = await storage.updateBookingStatus(id, status);
      return res.json(updated);
    }

    return res.status(403).json({ message: "Not authorized" });
  });

  // --- Admin Routes ---
  
  app.get(api.admin.users.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    const users = await storage.getAllUsers();
    res.json(users.map(u => omitPassword(u)));
  });

  app.delete(api.admin.deleteUser.path, async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') return res.sendStatus(401);
    const id = parseInt(req.params.id);
    await storage.deleteUser(id);
    res.sendStatus(200);
  });

  return httpServer;
}

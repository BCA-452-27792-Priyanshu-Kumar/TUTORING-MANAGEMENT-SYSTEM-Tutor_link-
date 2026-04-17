import { z } from 'zod';
import { insertUserSchema, insertTutorSchema, insertBookingSchema, users, tutors, bookings } from './schema';
export type { InsertUser, InsertTutor, InsertBooking } from './schema';

// Response schemas - omit password from all user responses
export const tutorProfileSchema = z.object({
  id: z.number(),
  userId: z.number(),
  bio: z.string(),
  subjects: z.array(z.string()),
  experience: z.number(),
  hourlyRate: z.number(),
});

export const userResponseSchema = z.object({
  id: z.number(),
  username: z.string(),
  role: z.enum(['student', 'tutor', 'admin']),
  name: z.string(),
  createdAt: z.string().optional(),
  tutorProfile: tutorProfileSchema.nullable().optional(),
});

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register' as const,
      input: insertUserSchema,
      responses: {
        201: userResponseSchema,
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: userResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: userResponseSchema,
        401: errorSchemas.unauthorized,
      },
    },
  },
  tutors: {
    list: {
      method: 'GET' as const,
      path: '/api/tutors' as const,
      input: z.object({
        subject: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof tutors.$inferSelect & { user: typeof users.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tutors/:id' as const,
      responses: {
        200: z.custom<typeof tutors.$inferSelect & { user: typeof users.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    update: { // For a tutor to update their own profile
      method: 'PUT' as const,
      path: '/api/tutors/profile' as const,
      input: insertTutorSchema,
      responses: {
        200: z.custom<typeof tutors.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings' as const,
      input: insertBookingSchema,
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: { // Lists bookings for the logged-in user (student or tutor)
      method: 'GET' as const,
      path: '/api/bookings' as const,
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect & { 
          tutor?: typeof tutors.$inferSelect & { user: typeof users.$inferSelect }, 
          student?: typeof users.$inferSelect 
        }>()),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id/status' as const,
      input: z.object({
        status: z.enum(["accepted", "rejected", "completed"]),
      }),
      responses: {
        200: z.custom<typeof bookings.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    users: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: {
        200: z.array(userResponseSchema),
      },
    },
    deleteUser: {
      method: 'DELETE' as const,
      path: '/api/admin/users/:id' as const,
      responses: {
        200: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

import { z } from "zod";

// Application form validation schema
export const applicationSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  applicantName: z.string().min(2, "Name must be at least 2 characters").max(255),
  phoneNumber: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  emergencyContactName: z
    .string()
    .min(2, "Emergency contact name must be at least 2 characters")
    .max(255)
    .optional()
    .or(z.literal("")),
  emergencyContactPhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  dietaryRestrictions: z.string().optional(),
  medicalConditions: z.string().optional(),
  specialRequirements: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

// Admin: Update application status schema
export const updateApplicationStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "waitlist"]),
  adminNotes: z.string().optional(),
});

export type UpdateApplicationStatusData = z.infer<typeof updateApplicationStatusSchema>;

// Event creation schema (for future use)
export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(255),
  description: z.string().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional(),
  location: z.string().max(255).optional(),
  applicationDeadline: z.string().or(z.date()).optional(),
  maxParticipants: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export type EventFormData = z.infer<typeof eventSchema>;

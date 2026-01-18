import { User, Event, Application } from "@prisma/client";

// Extend the default NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      isAdmin: boolean;
    };
  }

  interface User {
    isAdmin: boolean;
  }
}

// Application with related data
export type ApplicationWithRelations = Application & {
  user: User;
  event: Event;
  reviewer?: User | null;
};

// Event with application count
export type EventWithCount = Event & {
  _count: {
    applications: number;
  };
};

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Application status enum
export type ApplicationStatus = "pending" | "approved" | "rejected" | "waitlist";

// Filter types for admin views
export interface ApplicationFilters {
  eventId?: string;
  status?: ApplicationStatus;
  search?: string;
}

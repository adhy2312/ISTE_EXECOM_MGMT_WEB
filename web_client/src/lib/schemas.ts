import { z } from "zod";

// --- Authentication & User Schemas ---

export const UserProfileSchema = z.object({
  fullName: z.string().min(2, "Name is too short").max(100, "Name is too long").trim(),
  email: z.string().email("Invalid email format"),
  designation: z.string().max(50, "Designation too long").optional(),
});

// --- Points Request Schemas ---

export const EnergyPointRequestSchema = z.object({
  title: z.string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must not exceed 150 characters")
    .trim(),
  points: z.number()
    .int("Points must be an integer")
    .min(1, "Points must be greater than 0")
    .max(500, "Points request seems excessively high"),
  evidenceUrl: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  categoryId: z.string().min(1, "Category is required"),
});

// --- Validation Helper ---

export function validatePayload<T>(schema: z.ZodSchema<T>, payload: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(payload);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map((e: z.ZodIssue) => `${e.path.join(".")}: ${e.message}`),
    };
  }
  return { success: true, data: result.data };
}

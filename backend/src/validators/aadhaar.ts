import { z } from "zod";

// Aadhaar: 12 digits
export const aadhaarSchema = z
  .string()
  .regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits");

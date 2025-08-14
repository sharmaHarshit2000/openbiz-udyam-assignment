import { z } from "zod";

// PAN format: 5 letters, 4 digits, 1 letter (uppercase)
export const panSchema = z
  .string()
  .regex(/^[A-Z]{5}\d{4}[A-Z]$/, "PAN must match pattern AAAAA9999A");

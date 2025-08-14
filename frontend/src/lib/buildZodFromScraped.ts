import { z } from "zod";
import type { ScrapedStep, ScrapedField } from "../types";

/** Strong known validators */
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/i;

function fieldToZod(f: ScrapedField) {
  let s: z.ZodTypeAny = z.string().transform(v => typeof v === "string" ? v.trim() : v);

  const rules = f.validationRules || {};
  const attrs = f.attributes || {};

  if (rules.minLength) s = (s as z.ZodString).min(rules.minLength);
  if (rules.maxLength) s = (s as z.ZodString).max(rules.maxLength);

  const rawPattern = rules.pattern || attrs["pattern"];
  if (rawPattern) {
    try { s = (s as z.ZodString).regex(new RegExp(rawPattern)); } catch {}
  }

  const label = (f.label || "").toLowerCase();
  const key = (f.name || f.id || "").toLowerCase();

  if (label.includes("aadhaar") || key.includes("aadhaar")) s = z.string().regex(aadhaarRegex, "Aadhaar must be 12 digits");
  if (label.includes("pan") || key === "pan" || key.includes("pan")) s = z.string().regex(panRegex, "PAN format AAAAA9999A");

  if ((f.type || "").toLowerCase() === "email") s = (s as z.ZodString).email();

  const required = !!rules.required || attrs["required"] !== undefined;
  return { schema: required ? s : s.optional(), key: f.name || f.id };
}

export function buildZodFromScraped(step: ScrapedStep) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const f of step.inputs || []) {
    const info = fieldToZod(f);
    if (!info.key) continue;
    shape[info.key] = info.schema;
  }
  return z.object(shape).strict();
}

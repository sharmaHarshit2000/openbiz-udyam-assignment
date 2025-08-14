import { z } from "zod";
import { ScrapedStep, ScrapedField } from "./types.js";
import { aadhaarSchema } from "./validators/aadhaar.js";
import { panSchema } from "./validators/pan.js";

type FieldRule = {
  key: string;         // request payload key (prefer name, else id)
  schema: z.ZodTypeAny;
  required: boolean;
};

function fromFieldToZod(field: ScrapedField): FieldRule | null {
  const key = field.name || field.id;
  if (!key) return null;

  // base type
  let s: z.ZodTypeAny = z.string().transform(v => (typeof v === "string" ? v.trim() : v));

  // attributes from scraped
  const rules = field.validationRules || {};
  const attrs = field.attributes || {};

  // required?
  const required = !!rules.required || attrs["required"] !== undefined;

  // minlength/maxlength
  if (rules.minLength && rules.minLength > 0) {
    s = (s as z.ZodString).min(rules.minLength, `Min length ${rules.minLength}`);
  }
  if (rules.maxLength && rules.maxLength > 0) {
    s = (s as z.ZodString).max(rules.maxLength, `Max length ${rules.maxLength}`);
  }

  // pattern (from scraped)
  const rawPattern = rules.pattern || attrs["pattern"];
  if (rawPattern) {
    try {
      const re = new RegExp(rawPattern);
      s = (s as z.ZodString).regex(re, "Invalid format");
    } catch {
      // ignore invalid regex in scraped data
    }
  }

  // strengthen known fields
  const labelOrKey = (field.label || "").toLowerCase();
  const keyLower = key.toLowerCase();

  if (labelOrKey.includes("aadhaar") || keyLower.includes("aadhaar")) {
    s = aadhaarSchema;
  }
  if (labelOrKey.includes("pan") || keyLower === "pan" || keyLower.includes("pannumber")) {
    s = panSchema;
  }

  // type hints
  const inputType = (field.type || "").toLowerCase();
  if (inputType === "email") {
    s = (s as z.ZodString).email("Invalid email address");
  }

  return { key, schema: s, required };
}

export function buildZodFromScraped(step: ScrapedStep) {
  const rules: FieldRule[] = [];
  for (const f of step.inputs || []) {
    const r = fromFieldToZod(f);
    if (r) rules.push(r);
  }

  const shape: Record<string, z.ZodTypeAny> = {};
  for (const r of rules) {
    shape[r.key] = r.required ? r.schema : r.schema.optional().nullable().transform(v => (v === null ? undefined : v));
  }

  return z.object(shape).strict();
}

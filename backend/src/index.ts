import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { buildZodFromScraped } from "./schemaBuilder.js";
import { ScrapedStep } from "./types.js";
import { aadhaarSchema } from "./validators/aadhaar.js";
import { panSchema } from "./validators/pan.js";

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const SCRAPER_OUTPUT_DIR = process.env.SCRAPER_OUTPUT_DIR || "../scraper/js/output";

const r = (...p: string[]) => path.resolve(process.cwd(), ...p);

// Helpers
async function loadStep(filename: string): Promise<ScrapedStep> {
  const full = r(SCRAPER_OUTPUT_DIR, filename);
  const raw = await fs.readFile(full, "utf8");
  return JSON.parse(raw);
}

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// Serve scraped schemas
app.get("/api/form/step1", async (_req, res) => {
  try {
    const data = await loadStep("step1_aadhaar.json");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to load step1 schema", details: String(e) });
  }
});
app.get("/api/form/step2", async (_req, res) => {
  try {
    const data = await loadStep("step2_pan.json");
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: "Failed to load step2 schema", details: String(e) });
  }
});

// Validate + Save (Step 1)
app.post("/api/submit/step1", async (req, res) => {
  try {
    const schemaData = await loadStep("step1_aadhaar.json");
    const zod = buildZodFromScraped(schemaData);
    const parsed = zod.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ ok: false, errors: parsed.error.issues });
    }

    // Pull common fields (if present)
    const aadhaarKey = Object.keys(parsed.data).find(k => k.toLowerCase().includes("aadhaar"));
    const applicantNameKey = Object.keys(parsed.data).find(k => k.toLowerCase().includes("name"));
    const mobileKey = Object.keys(parsed.data).find(k => k.toLowerCase().includes("mobile"));
    const emailKey = Object.keys(parsed.data).find(k => k.toLowerCase().includes("email"));

    // extra hard check for Aadhaar
    if (aadhaarKey) {
      const ok = aadhaarSchema.safeParse(parsed.data[aadhaarKey]);
      if (!ok.success) return res.status(400).json({ ok: false, errors: ok.error.issues });
    }

    const saved = await prisma.submission.create({
      data: {
        aadhaar: aadhaarKey ? String(parsed.data[aadhaarKey]) : null,
        applicantName: applicantNameKey ? String(parsed.data[applicantNameKey]) : null,
        mobile: mobileKey ? String(parsed.data[mobileKey]) : null,
        email: emailKey ? String(parsed.data[emailKey]) : null,
        data: parsed.data
      }
    });

    res.json({ ok: true, id: saved.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Validate + Save (Step 2)
app.post("/api/submit/step2", async (req, res) => {
  try {
    const schemaData = await loadStep("step2_pan.json");
    const zod = buildZodFromScraped(schemaData);
    const parsed = zod.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ ok: false, errors: parsed.error.issues });
    }

    const panKey = Object.keys(parsed.data).find(k => k.toLowerCase() === "pan" || k.toLowerCase().includes("pan"));
    if (panKey) {
      const ok = panSchema.safeParse(parsed.data[panKey]);
      if (!ok.success) return res.status(400).json({ ok: false, errors: ok.error.issues });
    }

    const saved = await prisma.submission.create({
      data: {
        pan: panKey ? String(parsed.data[panKey]).toUpperCase() : null,
        data: parsed.data
      }
    });

    res.json({ ok: true, id: saved.id });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Backend listening on http://localhost:${PORT}`);
});

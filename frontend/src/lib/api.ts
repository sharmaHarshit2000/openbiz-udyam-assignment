import axios from "axios";
import type { ScrapedStep } from "../types";

// Use env var for backend URL, fallback to localhost:4000 in dev
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export async function fetchStep(step: 1 | 2): Promise<ScrapedStep> {
  const res = await axios.get(`${API_BASE}/form/step${step}`);
  return res.data;
}

export async function submitStep(step: 1 | 2, payload: any) {
  const res = await axios.post(`${API_BASE}/submit/step${step}`, payload);
  return res.data;
}

/** PIN -> city/state lookup using India post public API */
export async function lookupPin(pin: string) {
  const url = `https://api.postalpincode.in/pincode/${pin}`;
  const res = await axios.get(url);
  return res.data;
}

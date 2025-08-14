import React, { useState } from "react";
import { lookupPin } from "../lib/api";

type Props = { setValue: (field: string, value: any) => void };

export default function PinAutoFill({ setValue }: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleLookup() {
    if (!/^\d{6}$/.test(pin)) { setMsg("PIN must be 6 digits"); return; }
    setLoading(true);
    try {
      const res = await lookupPin(pin);
      const payload = res?.[0];
      if (payload?.Status === "Success" && payload?.PostOffice?.length) {
        const po = payload.PostOffice[0];
        const city = po?.District || po?.Region || "";
        const state = po?.State || "";
        setValue("city", city);  // field name must match scraped JSON
        setValue("state", state);
        setMsg(`Filled: ${city}, ${state}`);
      } else {
        setMsg("PIN not found");
      }
    } catch {
      setMsg("Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        value={pin}
        onChange={e => setPin(e.target.value)}
        placeholder="PIN"
        className="p-2 border rounded-md w-24"
      />
      <button
        onClick={handleLookup}
        type="button"
        disabled={loading}
        className="px-3 py-2 bg-gray-800 text-white rounded-md"
      >
        {loading ? "..." : "AutoFill"}
      </button>
      {msg && <span className="text-sm text-gray-600">{msg}</span>}
    </div>
  );
}

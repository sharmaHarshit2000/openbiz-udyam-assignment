import { useEffect, useState } from "react";
import { fetchStep, submitStep } from "../lib/api";
import type { ScrapedStep } from "../types";
import DynamicForm from "../components/DynamicForm";
import PinAutoFill from "../components/PinAutoFill";
import ProgressTracker from "../components/ProgressTracker";

export default function Home() {
  const [stepData, setStepData] = useState<ScrapedStep | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchStep(1).then(setStepData);
  }, []);

  const handleSubmit = async (data: any) => {
    setBusy(true);
    try {
      const res = await submitStep(1, data);
      console.log("Submit response", res);
      alert("Step 1 submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Submission failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Udyam Registration — Demo</h1>
      <ProgressTracker current={1} />

      {stepData ? (
        <>
          <DynamicForm
            step={1}
            schema={stepData}
            busy={busy}
            onSubmit={handleSubmit}
            onReady={({ setValue }) => {
              // Render PIN autofill for forms that have city/state fields
              if (stepData.inputs.some((f) => f.name === "city" || f.name === "state")) {
                const autofillEl = document.getElementById("pin-autofill");
                if (autofillEl) {
                  autofillEl.innerHTML = ""; // reset
                  const container = document.createElement("div");
                  autofillEl.appendChild(container);
                }
              }
            }}
          />
          <div id="pin-autofill" className="mt-4">
            <PinAutoFill setValue={(field, value) => console.log("Set field", field, value)} />
          </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

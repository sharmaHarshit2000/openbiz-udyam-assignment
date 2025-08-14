import React from "react";

type Props = { current: 1|2 };

export default function ProgressTracker({ current }: Props) {
  const steps = [
    { id:1, title: "Aadhaar" },
    { id:2, title: "PAN" }
  ];
  return (
    <div className="flex items-center gap-4">
      {steps.map(s => (
        <div key={s.id} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${current===s.id ? "bg-blue-700 text-white" : "bg-gray-200 text-gray-700"}`}>
            {s.id}
          </div>
          <div className="hidden sm:block text-sm">{s.title}</div>
        </div>
      ))}
    </div>
  );
}

import React from "react";
import type { ScrapedField } from "../types";

export default function FormRenderer({ fields }: { fields: ScrapedField[] }) {
  return (
    <form className="max-w-lg mx-auto bg-white shadow p-6 rounded space-y-4">
      {fields.map((field, idx) => (
        <div key={idx} className="flex flex-col">
          {field.label && (
            <label className="text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
          )}

          {field.type === "text" && (
            <input
              name={field.name}
              placeholder={field.placeholder}
              className="border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
            />
          )}

          {field.type === "checkbox" && (
            <label className="inline-flex items-center space-x-2">
              <input type="checkbox" name={field.name} />
              <span>{field.placeholder || "I agree"}</span>
            </label>
          )}

          {/* Add other field types here */}
        </div>
      ))}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Submit Step 1
      </button>
    </form>
  );
}

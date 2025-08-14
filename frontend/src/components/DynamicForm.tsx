import React, { useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { buildZodFromScraped } from "../lib/buildZodFromScraped";
import type { ScrapedStep } from "../types";

type Props = {
  step: 1 | 2;
  schema: ScrapedStep;
  onSubmit: (data: any) => Promise<void>;
  busy?: boolean;
  onReady?: (helpers: { setValue: (field: string, value: any) => void }) => void; // NEW
};

export default function DynamicForm({ step, schema, onSubmit, busy, onReady }: Props) {
  const zodSchema = useMemo(() => buildZodFromScraped(schema), [schema]);
  const { register, handleSubmit, formState, setValue } = useForm({ resolver: zodResolver(zodSchema) });
  const { errors } = formState;

  useEffect(() => {
    if (onReady) onReady({ setValue }); // expose setValue when form mounts
  }, [onReady, setValue]);

  const fields = schema.inputs?.filter(f => (f.name || f.id) && f.tag !== "button") ?? [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {fields.map((f, i) => {
        const key = f.name || f.id!;
        const label = f.label || key;
        const type = (f.type || "text").toLowerCase();
        const isSelect = f.tag === "select";
        const isTextarea = f.tag === "textarea";

        return (
          <div key={key + i} className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>

            {isSelect ? (
              <select {...register(key)} className="p-2 rounded-md border">
                <option value="">Select</option>
              </select>
            ) : isTextarea ? (
              <textarea {...register(key)} placeholder={f.placeholder || ""} className="p-2 rounded-md border" />
            ) : (
              <input
                {...register(key)}
                type={["email", "number", "tel", "password", "date"].includes(type) ? type : "text"}
                placeholder={f.placeholder || ""}
                className="p-2 rounded-md border"
              />
            )}

            {errors && (errors as any)[key] && (
              <p className="text-xs text-red-600 mt-1">{(errors as any)[key].message}</p>
            )}
          </div>
        );
      })}

      <button type="submit" disabled={busy} className="w-full py-2 rounded-xl bg-blue-700 text-white">
        {busy ? "Submitting..." : `Submit Step ${step}`}
      </button>
    </form>
  );
}

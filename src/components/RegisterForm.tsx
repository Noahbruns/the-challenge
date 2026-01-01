"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { EXERCISE_CATALOG } from "~/constants";
import { Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function RegisterForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const [name, setName] = useState("");
  const [selection, setSelection] = useState<{ exercise: string; level: "S" | "M" | "L" | "XL"; target: number; unit: string } | null>(null);

  const register = api.user.register.useMutation({
    onSuccess: () => {
      onSuccess(name);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && selection) {
      register.mutate({
        name,
        exercise: selection.exercise,
        target: selection.target * 12, // Annual target
        unit: selection.unit,
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Neues Ziel registrieren</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-semibold text-slate-700 mb-2 text-center text-lg">Dein Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-800 focus:border-transparent outline-none transition-all text-center text-xl font-medium"
            placeholder="Name eingeben..."
            required
          />
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-800 text-sm text-center">
            Wähle eine Schwierigkeitsstufe. Die Werte sind <strong>Monatsziele</strong>.
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead className="bg-slate-800 text-white">
                <tr>
                  <th className="p-3 rounded-tl-xl">Übung</th>
                  <th className="p-3">Einheit</th>
                  <th className="p-3 text-sm">S (Small)</th>
                  <th className="p-3 text-sm">M (Medium)</th>
                  <th className="p-3 text-sm">L (Large)</th>
                  <th className="p-3 rounded-tr-xl text-sm">XL (X-Large)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EXERCISE_CATALOG.map((ex) => (
                  <tr key={ex.exercise} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-semibold text-slate-700 text-left">{ex.exercise}</td>
                    <td className="p-3 text-slate-400 text-sm">{ex.unit}</td>
                    {(["S", "M", "L", "XL"] as const).map((lvl) => (
                      <td
                        key={lvl}
                        onClick={() => setSelection({ exercise: ex.exercise, level: lvl, target: ex[lvl], unit: ex.unit })}
                        className={cn(
                          "p-3 cursor-pointer transition-all border-l border-slate-50",
                          selection?.exercise === ex.exercise && selection?.level === lvl
                            ? "bg-slate-800 text-white font-bold"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {ex[lvl]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selection && (
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-emerald-800 text-center animate-in fade-in slide-in-from-bottom-2">
            <p className="font-semibold">
              Gewählt: {selection.exercise} - {selection.target} {selection.unit} / Monat
            </p>
            <p className="text-sm opacity-80">Jahresziel: {selection.target * 12} {selection.unit}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!name || !selection || register.isPending}
          className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-lg hover:bg-slate-900 focus:ring-4 focus:ring-slate-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {register.isPending ? "Wird registriert..." : "Registrieren & Loslegen"}
        </button>
      </form>
    </div>
  );
}

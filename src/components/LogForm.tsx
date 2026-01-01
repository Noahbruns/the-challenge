"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function LogForm({ currentUser, onSuccess }: { currentUser: string | null; onSuccess: () => void }) {
  const [userName, setUserName] = useState(currentUser || "");
  const [exercise, setExercise] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: users } = api.user.getAll.useQuery();
  const logAchievement = api.achievement.log.useMutation({
    onSuccess: () => {
      onSuccess();
    },
  });

  const selectedUser = users?.find((u) => u.name === userName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName && exercise && value && date) {
      logAchievement.mutate({
        userName,
        exercise,
        value: parseFloat(value),
        date: new Date(date!).toISOString(),
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
      <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Training eintragen</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Wer bist du?</label>
          <select
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setExercise(""); // Reset exercise when user changes
            }}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            required
          >
            <option value="">Teilnehmer wählen...</option>
            {users?.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Welche Übung?</label>
          <select
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
            disabled={!selectedUser}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400"
            required
          >
            <option value="">Übung wählen...</option>
            {selectedUser?.goals.map((g) => (
              <option key={g.id} value={g.exercise}>
                {g.exercise} ({g.unit})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Wert</label>
            <input
              type="number"
              step="any"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              placeholder="z.B. 50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Datum</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={logAchievement.isPending}
          className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
        >
          {logAchievement.isPending ? "Wird gespeichert..." : "Speichern"}
        </button>
      </form>
    </div>
  );
}

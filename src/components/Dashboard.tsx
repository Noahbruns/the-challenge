"use client";

import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartLine, CalendarDays, Dumbbell, UserCheck } from "lucide-react";

const COLORS = ["#3498db", "#1abc9c", "#e74c3c", "#f1c40f", "#9b59b6", "#e67e22", "#2ecc71", "#34495e"];

export function Dashboard({
  currentUser,
  setCurrentUser,
}: {
  currentUser: string | null;
  setCurrentUser: (name: string) => void;
}) {
  const [detailUser, setDetailUser] = useState(currentUser || "");
  const [detailMode, setDetailMode] = useState<"year" | "month">("year");

  const { data: stats, isLoading } = api.achievement.getStats.useQuery();

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const yearPacer = (dayOfYear / 365) * 100;

  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const monthPacer = (dayOfMonth / daysInMonth) * 100;

  const chartData = useMemo(() => {
    if (!stats) return { year: [], month: [], exercise: [] };

    const yearData = stats.map((u) => {
      let totalPerc = 0;
      u.goals.forEach((g) => {
        const sum = u.achievements
          .filter((a) => a.exercise === g.exercise)
          .reduce((acc, a) => acc + a.value, 0);
        totalPerc += Math.min((sum / g.target) * 100, 100);
      });
      return {
        name: u.name,
        progress: u.goals.length ? (totalPerc / u.goals.length).toFixed(1) : 0,
      };
    });

    const monthData = stats.map((u) => {
      let totalPerc = 0;
      u.goals.forEach((g) => {
        const mTarget = g.target / 12;
        const mSum = u.achievements
          .filter((a) => {
            const d = new Date(a.date);
            return (
              a.exercise === g.exercise &&
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear()
            );
          })
          .reduce((acc, a) => acc + a.value, 0);
        totalPerc += Math.min((mSum / mTarget) * 100, 100);
      });
      return {
        name: u.name,
        progress: u.goals.length ? (totalPerc / u.goals.length).toFixed(1) : 0,
      };
    });

    const exerciseTotals: Record<string, number> = {};
    stats.forEach((u) => {
      u.achievements.forEach((a) => {
        exerciseTotals[a.exercise] = (exerciseTotals[a.exercise] || 0) + a.value;
      });
    });

    const exerciseData = Object.entries(exerciseTotals).map(([name, value]) => ({ name, value }));

    return {
      year: [{ name: "Push (Pacer)", progress: yearPacer.toFixed(1) }, ...yearData],
      month: [{ name: "Push (Pacer)", progress: monthPacer.toFixed(1) }, ...monthData],
      exercise: exerciseData,
    };
  }, [stats, yearPacer, monthPacer, now]);

  const selectedStats = stats?.find((u) => u.name === detailUser);

  if (isLoading) return <div className="text-center py-20 font-medium text-slate-500">Daten werden geladen...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-8">
        {/* Year Progress */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ChartLine className="text-blue-500" size={20} />
              Jahresfortschritt (max. 100%)
            </h3>
            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-500 rounded-full uppercase tracking-wider">
              Pacer: Push
            </span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.year}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} unit="%" />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                />
                <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                  {chartData.year.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Push (Pacer)" ? "#94a3b8" : "#3b82f6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Month progress */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <CalendarDays className="text-emerald-500" size={20} />
              Monatsziel (max. 100%)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.month}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                  <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                  <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
                    {chartData.month.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.name === "Push (Pacer)" ? "#94a3b8" : "#10b981"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Exercise totals */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Dumbbell className="text-orange-500" size={20} />
              Übungs-Vergleich (Total)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.exercise}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name }) => name}
                  >
                    {chartData.exercise.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Personal Detail */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="text-indigo-500" size={20} />
              Persönlicher Status
            </h3>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setDetailMode("year")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  detailMode === "year" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                }`}
              >
                Jahr
              </button>
              <button
                onClick={() => setDetailMode("month")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  detailMode === "month" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"
                }`}
              >
                Monat
              </button>
            </div>
          </div>

          <div className="max-w-md mb-6">
            <select
              value={detailUser}
              onChange={(e) => {
                setDetailUser(e.target.value);
                if (e.target.value !== "Push") {
                  setCurrentUser(e.target.value);
                  localStorage.setItem("push_challenge_user", e.target.value);
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              <option value="">Teilnehmer wählen...</option>
              <option value="Push">Push (Pacer)</option>
              {stats?.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-4">
            {detailUser === "Push" &&
              [...new Set(stats?.flatMap((u) => u.goals.map((g) => g.exercise)))].map((ex) => {
                const p = detailMode === "year" ? yearPacer : monthPacer;
                return (
                  <div key={ex} className="space-y-2">
                    <div className="flex justify-between text-sm font-medium text-slate-700">
                      <span>{ex}</span>
                      <span>Soll: {p.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className="bg-slate-400 h-full transition-all duration-1000" style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}

            {selectedStats?.goals.map((g) => {
              const target = detailMode === "year" ? g.target : g.target / 12;
              const sum = selectedStats.achievements
                .filter((a) => {
                  if (a.exercise !== g.exercise) return false;
                  if (detailMode === "month") {
                    const d = new Date(a.date);
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }
                  return true;
                })
                .reduce((acc, a) => acc + a.value, 0);

              const p = Math.min((sum / target) * 100, 100);
              const displayP = (p).toFixed(1);

              return (
                <div key={g.id} className="space-y-2 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex justify-between items-end">
                    <div>
                      <h4 className="font-bold text-slate-800">{g.exercise}</h4>
                      <p className="text-sm text-slate-500">
                        {sum.toFixed(1)} / {target.toFixed(1)} {g.unit}
                      </p>
                    </div>
                    <span className={`text-sm font-bold ${p >= 100 ? "text-emerald-600" : "text-blue-600"}`}>
                      {displayP}%
                    </span>
                  </div>
                  <div className="w-full bg-white h-4 rounded-full border border-slate-200 overflow-hidden p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${
                        p >= 100 ? "bg-emerald-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${p}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

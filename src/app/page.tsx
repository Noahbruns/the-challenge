"use client";

import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Layout } from "~/components/Layout";
import { Dashboard } from "~/components/Dashboard";
import { LogForm } from "~/components/LogForm";
import { RegisterForm } from "~/components/RegisterForm";
import { Trophy, LayoutDashboard, PenLine, UserPlus, RefreshCw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "log" | "register">("dashboard");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("push_challenge_user");
    if (savedUser) {
      setCurrentUser(savedUser);
    }
  }, []);

  const utils = api.useUtils();

  const handleRefresh = async () => {
    await utils.achievement.getStats.invalidate();
    await utils.user.getAll.invalidate();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-slate-800 flex items-center justify-center gap-3">
            <Trophy className="text-amber-500 w-10 h-10" />
            The Challenge 2026
          </h1>
        </header>

        <nav className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              activeTab === "dashboard" ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("log")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              activeTab === "log" ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <PenLine size={20} />
            Fortschritt
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all",
              activeTab === "register" ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <UserPlus size={20} />
            Registrierung
          </button>
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center px-4 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            title="Aktualisieren"
          >
            <RefreshCw size={20} />
          </button>
        </nav>

        <div className="transition-all duration-300">
          {activeTab === "dashboard" && <Dashboard currentUser={currentUser} setCurrentUser={setCurrentUser} />}
          {activeTab === "log" && <LogForm currentUser={currentUser} onSuccess={() => setActiveTab("dashboard")} />}
          {activeTab === "register" && <RegisterForm onSuccess={(name) => {
            setCurrentUser(name);
            localStorage.setItem("push_challenge_user", name);
            setActiveTab("dashboard");
          }} />}
        </div>
      </div>
    </Layout>
  );
}

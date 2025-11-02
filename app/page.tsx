"use client";

import { useState } from "react";
import { VapiWidget } from "@/components/VapiWidget";
import { ElevenLabsWidget } from "@/components/ElevenLabsWidget";

export default function Home() {
  const [activeWidget, setActiveWidget] = useState<"vapi" | "elevenlabs">("vapi");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* Toggle buttons at the top */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 bg-white/30 backdrop-blur-xl rounded-full p-1 shadow-lg border border-white/40">
        <button
          onClick={() => setActiveWidget("vapi")}
          className={`px-6 py-2 rounded-full transition-all font-semibold ${
            activeWidget === "vapi"
              ? "bg-indigo-600/90 text-white shadow-lg"
              : "text-slate-700 hover:bg-white/50"
          }`}
        >
          Vapi
        </button>
        <button
          onClick={() => setActiveWidget("elevenlabs")}
          className={`px-6 py-2 rounded-full transition-all font-semibold ${
            activeWidget === "elevenlabs"
              ? "bg-indigo-600/90 text-white shadow-lg"
              : "text-slate-700 hover:bg-white/50"
          }`}
        >
          ElevenLabs
        </button>
      </div>

      {/* Render active widget */}
      {activeWidget === "vapi" ? <VapiWidget /> : <ElevenLabsWidget />}
    </main>
  );
}

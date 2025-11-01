"use client";

import { VapiWidget } from "@/components/VapiWidget";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Vapi Voice Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Click the button below to start a conversation with our AI voice
            assistant
          </p>
        </div>

        <VapiWidget />
      </div>
    </main>
  );
}

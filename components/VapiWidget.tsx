"use client";

import { useEffect, useState } from "react";
import { useVapi } from "@/hooks/useVapi";
import { VapiVisualization } from "@/components/VapiVisualization";

export const VapiWidget = () => {
  const [assistantId, setAssistantId] = useState("");
  const {
    call,
    endCall,
    isCallActive,
    isLoading,
    messages,
    transcripts,
    volumeLevel,
    isSpeaking,
    isUserSpeaking,
    status,
    error,
  } = useVapi();

  const handleStartCall = async () => {
    if (!assistantId.trim()) {
      alert("Please enter an Assistant ID");
      return;
    }
    await call(assistantId);
  };

  const handleEndCall = () => {
    endCall();
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="assistant-id"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Assistant ID
          </label>
          <input
            id="assistant-id"
            type="text"
            value={assistantId}
            onChange={(e) => setAssistantId(e.target.value)}
            placeholder="Enter your Vapi Assistant ID"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            disabled={isCallActive}
          />
        </div>

        <div className="flex gap-4">
          {!isCallActive ? (
            <button
              onClick={handleStartCall}
              disabled={isLoading || !assistantId.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
            >
              {isLoading ? "Connecting..." : "Start Call"}
            </button>
          ) : (
            <button
              onClick={handleEndCall}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              End Call
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {status && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Status: <span className="font-semibold">{status}</span>
            </p>
          </div>
        )}
      </div>

      {/* Visualization Component */}
      {isCallActive && (
        <VapiVisualization
          transcripts={transcripts}
          volumeLevel={volumeLevel}
          isSpeaking={isSpeaking}
          isUserSpeaking={isUserSpeaking}
        />
      )}

      {/* Messages/Conversation */}
      {messages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Conversation</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-100 dark:bg-blue-900/30 ml-auto max-w-[80%]"
                    : "bg-gray-100 dark:bg-gray-700 max-w-[80%]"
                }`}
              >
                <p className="text-sm font-medium mb-1">
                  {message.role === "user" ? "You" : "Assistant"}
                </p>
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

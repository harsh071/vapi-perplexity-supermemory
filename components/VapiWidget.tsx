"use client";

import { useEffect, useState } from "react";
import { useVapi } from "@/hooks/useVapi";
import { VapiVisualization } from "@/components/VapiVisualization";

export const VapiWidget = () => {
  const [assistantId, setAssistantId] = useState("");
  const [usePhoneCall, setUsePhoneCall] = useState(false);
  const [customerNumber, setCustomerNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
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
    audioData,
    downloadAudio,
    isListening,
  } = useVapi();

  const handleStartCall = async () => {
    if (!assistantId.trim()) {
      alert("Please enter an Assistant ID");
      return;
    }

    if (usePhoneCall) {
      if (!customerNumber.trim() || !phoneNumberId.trim()) {
        alert("Please enter Customer Number and Phone Number ID for phone calls");
        return;
      }
      await call(assistantId, {
        usePhoneCall: true,
        customerNumber: customerNumber.trim(),
        phoneNumberId: phoneNumberId.trim(),
      });
    } else {
      await call(assistantId);
    }
  };

  const handleEndCall = () => {
    endCall();
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        <div className="space-y-4">
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

          <div className="flex items-center gap-2">
            <input
              id="use-phone-call"
              type="checkbox"
              checked={usePhoneCall}
              onChange={(e) => setUsePhoneCall(e.target.checked)}
              disabled={isCallActive}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="use-phone-call"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Use Phone Call (enables Call Listen feature)
            </label>
          </div>

          {usePhoneCall && (
            <>
              <div className="space-y-2">
                <label
                  htmlFor="customer-number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Customer Phone Number
                </label>
                <input
                  id="customer-number"
                  type="tel"
                  value={customerNumber}
                  onChange={(e) => setCustomerNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isCallActive}
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="phone-number-id"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone Number ID
                </label>
                <input
                  id="phone-number-id"
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="Enter your Vapi Phone Number ID"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  disabled={isCallActive}
                />
              </div>
            </>
          )}
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
            <div className="flex items-center justify-between">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Status: <span className="font-semibold">{status}</span>
              </p>
              {isListening && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                    Listening
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {isCallActive && audioData.length > 0 && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-800 dark:text-green-200">
                Audio Data: <span className="font-semibold">{audioData.length} chunks received</span>
              </p>
              <button
                onClick={downloadAudio}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Download Audio (PCM)
              </button>
            </div>
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

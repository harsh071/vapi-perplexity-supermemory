"use client";

import { useState } from "react";
import { useVapi } from "@/hooks/useVapi";
import { VapiSphereVisualization } from "@/components/VapiSphereVisualization";
import { Settings, Upload, X, Mic, MicOff } from "lucide-react";

export const VapiWidget = () => {
  const [assistantId, setAssistantId] = useState("");
  const [usePhoneCall, setUsePhoneCall] = useState(false);
  const [customerNumber, setCustomerNumber] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const {
    call,
    endCall,
    isCallActive,
    isLoading,
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Voice Assistant Call",
        text: "Check out this voice assistant!",
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Setup view (when call is not active)
  if (!isCallActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-gray-800">
              Voice Assistant
            </h1>
            <p className="text-sm text-gray-600">
              Enter your Assistant ID to begin
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="assistant-id"
                className="block text-sm font-medium text-gray-700"
              >
                Assistant ID
              </label>
              <input
                id="assistant-id"
                type="text"
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
                placeholder="Enter your Vapi Assistant ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="use-phone-call"
                type="checkbox"
                checked={usePhoneCall}
                onChange={(e) => setUsePhoneCall(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="use-phone-call"
                className="text-sm font-medium text-gray-700"
              >
                Use Phone Call
              </label>
            </div>

            {usePhoneCall && (
              <>
                <div className="space-y-2">
                  <label
                    htmlFor="customer-number"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Customer Phone Number
                  </label>
                  <input
                    id="customer-number"
                    type="tel"
                    value={customerNumber}
                    onChange={(e) => setCustomerNumber(e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone-number-id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number ID
                  </label>
                  <input
                    id="phone-number-id"
                    type="text"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="Enter your Vapi Phone Number ID"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleStartCall}
            disabled={isLoading || !assistantId.trim()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            {isLoading ? "Connecting..." : "Start Call"}
          </button>
        </div>
      </div>
    );
  }

  // Active call view - minimalistic UI
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
      {/* Settings Icon - Top Right */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-800/80 hover:bg-gray-900 rounded-full transition-colors z-10"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-white" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-6 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-4 min-w-[200px] z-20">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-800 mb-2">Settings</p>
            <p className="text-xs text-gray-600">Status: {status || "Connected"}</p>
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Share Icon - Mid Left (Upload icon) */}
      <button
        onClick={handleShare}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-colors z-10"
        aria-label="Share"
      >
        <Upload className="w-6 h-6 text-white" />
      </button>

      {/* Central Sphere Visualization */}
      <div className="w-full h-full flex items-center justify-center absolute inset-0">
        <div className="w-full h-full max-w-5xl max-h-[80vh] aspect-square">
          <VapiSphereVisualization
            volumeLevel={volumeLevel}
            isSpeaking={isSpeaking}
            isUserSpeaking={isUserSpeaking}
          />
        </div>
      </div>

      {/* Bottom Control Buttons */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        {/* End Call Button (X) */}
        <button
          onClick={handleEndCall}
          className="w-14 h-14 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full shadow-lg transition-colors"
          aria-label="End Call"
        >
          <X className="w-6 h-6 text-gray-800" />
        </button>

        {/* Mute/Unmute Button (Microphone) */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-colors ${
            isMuted
              ? "bg-red-500 hover:bg-red-600"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-gray-800" />
          )}
        </button>
      </div>
    </div>
  );
};

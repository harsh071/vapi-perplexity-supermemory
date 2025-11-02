"use client";

import { useState, useEffect } from "react";
import { useElevenLabs } from "@/hooks/useElevenLabs";
import { VapiSphereVisualization } from "@/components/VapiSphereVisualization";
import { Settings, Upload, X, Mic, MicOff } from "lucide-react";

export const ElevenLabsWidget = () => {
  const [agentId, setAgentId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Load configuration from environment variables on mount
  useEffect(() => {
    const envAgentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      
    if (envAgentId) {
      setAgentId(envAgentId);
    }
  }, []);

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
  } = useElevenLabs();

  const handleStartCall = async () => {
    if (!agentId.trim()) {
      alert("Please enter an Agent ID");
      return;
    }

    await call(agentId);
  };

  const handleEndCall = () => {
    endCall();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "ElevenLabs Voice Agent",
        text: "Check out this voice assistant!",
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  // Setup view (when call is not active)
  if (!isCallActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-slate-800">
              ElevenLabs Voice Agent
            </h1>
            <p className="text-sm text-slate-600">
              Enter your Agent ID to begin
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="agent-id"
                className="block text-sm font-medium text-slate-700"
              >
                Agent ID
              </label>
              <input
                id="agent-id"
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="Enter your ElevenLabs Agent ID"
                className="w-full px-4 py-3 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-slate-800 placeholder:text-slate-400 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleStartCall}
            disabled={isLoading || !agentId.trim()}
            className="w-full px-6 py-3 bg-indigo-600/90 backdrop-blur-sm hover:bg-indigo-700/90 disabled:bg-slate-400/50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 border border-indigo-400/30"
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
        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/30 backdrop-blur-xl hover:bg-white/40 rounded-full transition-all z-10 border border-white/40 shadow-lg shadow-slate-500/10"
        aria-label="Settings"
      >
        <Settings className="w-5 h-5 text-slate-700" />
      </button>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-20 right-6 bg-white/40 backdrop-blur-xl rounded-2xl shadow-2xl p-4 min-w-[200px] z-20 border border-white/50">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-800 mb-2">Settings</p>
            <p className="text-xs text-slate-600">Status: {status || "Connected"}</p>
            {error && (
              <p className="text-xs text-red-700">{error}</p>
            )}
          </div>
        </div>
      )}

      {/* Share Icon - Mid Left (Upload icon) */}
      <button
        onClick={handleShare}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-indigo-600/80 backdrop-blur-sm hover:bg-indigo-700/80 rounded-full shadow-lg shadow-indigo-500/30 transition-all z-10 border border-indigo-400/30"
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
          className="w-14 h-14 flex items-center justify-center bg-white/40 backdrop-blur-xl hover:bg-white/50 rounded-full shadow-lg shadow-slate-500/20 transition-all border border-white/50"
          aria-label="End Call"
        >
          <X className="w-6 h-6 text-slate-700" />
        </button>

        {/* Mute/Unmute Button (Microphone) */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-all border ${
            isMuted
              ? "bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80 border-red-400/30 shadow-red-500/30"
              : "bg-white/40 backdrop-blur-xl hover:bg-white/50 border-white/50 shadow-slate-500/20"
          }`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-slate-700" />
          )}
        </button>
      </div>
    </div>
  );
};


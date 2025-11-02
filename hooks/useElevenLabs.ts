"use client";

/**
 * ElevenLabs Integration Hook
 * 
 * Uses the official @elevenlabs/react SDK for proper WebRTC integration.
 * This provides a complete implementation with all WebRTC signaling handled.
 */

import { useConversation } from "@elevenlabs/react";
import { useState, useEffect } from "react";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: number;
}

export interface TranscriptMessage {
  type: "transcript";
  transcript: string;
  role: "user" | "assistant";
  timestamp?: number;
}

interface UseElevenLabsReturn {
  call: (agentId: string) => Promise<void>;
  endCall: () => Promise<void>;
  isCallActive: boolean;
  isLoading: boolean;
  messages: Message[];
  transcripts: TranscriptMessage[];
  volumeLevel: number;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  status: string | null;
  error: string | null;
  audioData: any[];
  downloadAudio: () => void;
  isListening: boolean;
}

export const useElevenLabs = (): UseElevenLabsReturn => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [statusState, setStatusState] = useState<string | null>(null);

  // Initialize the conversation hook with callbacks
  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected to ElevenLabs");
      setStatusState("Connected");
      setError(null);
    },
    onDisconnect: (details) => {
      console.log("Disconnected from ElevenLabs", details);
      setStatusState("Disconnected");
    },
    onError: (error) => {
      console.error("ElevenLabs error:", error);
      // error is a string, not an Error object
      setError(typeof error === "string" ? error : "Connection error occurred");
      setStatusState("Error");
    },
    onMessage: (message) => {
      console.log("Message:", message);
      
      // Add to messages
      // Convert ElevenLabs "ai" role to "assistant"
      const role = message.source === "ai" ? "assistant" : message.source || "assistant";
      const msg: Message = {
        role: role as "user" | "assistant" | "system",
        content: message.message || "",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, msg]);

      // Add to transcripts if it's a transcript message
      if (message.message && (msg.role === "user" || msg.role === "assistant")) {
        const transcript: TranscriptMessage = {
          type: "transcript",
          transcript: message.message,
          role: msg.role as "user" | "assistant",
          timestamp: msg.timestamp,
        };
        setTranscripts((prev) => [...prev, transcript]);
      }
    },
    onStatusChange: (status) => {
      console.log("Status changed:", status);
      setStatusState(status.status || status);
    },
    onModeChange: (mode) => {
      console.log("Mode changed:", mode);
    },
  });

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

    if (!apiKey) {
      setError(
        "ElevenLabs API key is not set. Please add NEXT_PUBLIC_ELEVENLABS_API_KEY to your .env.local file"
      );
    }
  }, []);

  const call = async (agentId: string) => {
    try {
      setError(null);
      setStatusState("Connecting");
      
      // Start the session with the agent ID
      await conversation.startSession({
        agentId,
        connectionType: "webrtc",
      });
      
      // Clear previous messages
      setMessages([]);
      setTranscripts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
      setStatusState("Error");
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setMessages([]);
      setTranscripts([]);
      setStatusState(null);
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  const downloadAudio = () => {
    alert("Audio download not yet implemented in this SDK integration");
  };

  return {
    call,
    endCall,
    isCallActive: statusState === "connected" || statusState === "Connecting",
    isLoading: statusState === "Connecting",
    messages,
    transcripts,
    volumeLevel: 0, // Volume level not directly available from SDK
    isSpeaking: conversation.isSpeaking,
    isUserSpeaking: false, // User speaking detection not directly available
    status: statusState,
    error,
    audioData: [],
    downloadAudio,
    isListening: false,
  };
};

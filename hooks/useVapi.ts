"use client";

import { useEffect, useState, useRef } from "react";
import Vapi from "@vapi-ai/web";

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

interface SpeechUpdateMessage {
  type: "speech-update";
  status?: string;
  role?: "user" | "assistant";
}

interface VapiMessage {
  type?: string;
  transcript?: string;
  role?: "user" | "assistant" | "system";
  content?: string;
  message?: string;
  [key: string]: any;
}

interface UseVapiReturn {
  call: (assistantId: string) => void;
  endCall: () => void;
  isCallActive: boolean;
  isLoading: boolean;
  messages: Message[];
  transcripts: TranscriptMessage[];
  volumeLevel: number;
  isSpeaking: boolean;
  isUserSpeaking: boolean;
  status: string | null;
  error: string | null;
}

export const useVapi = (): UseVapiReturn => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const vapiRef = useRef<Vapi | null>(null);

  useEffect(() => {
    const apiKey =
      process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_VAPI_API_KEY;

    if (!apiKey) {
      setError(
        "Vapi API key is not set. Please add NEXT_PUBLIC_VAPI_PUBLIC_KEY or NEXT_PUBLIC_VAPI_API_KEY to your .env.local file"
      );
      return;
    }

    const vapi = new Vapi(apiKey);
    vapiRef.current = vapi;

    const handleMessage = (vapiMessage: VapiMessage) => {
      const timestamp = Date.now();

      // Handle transcript messages
      if (vapiMessage.type === "transcript" && vapiMessage.transcript) {
        const transcriptMsg: TranscriptMessage = {
          type: "transcript",
          transcript: vapiMessage.transcript,
          role: (vapiMessage.role as "user" | "assistant") || "assistant",
          timestamp,
        };
        setTranscripts((prev) => [...prev, transcriptMsg]);

        // Also add to messages for backward compatibility
        const message: Message = {
          role: transcriptMsg.role,
          content: vapiMessage.transcript,
          timestamp,
        };
        setMessages((prev) => [...prev, message]);
      } else if (vapiMessage.type === "speech-update") {
        // Handle speech updates (e.g., speaking status)
        const speechUpdate = vapiMessage as SpeechUpdateMessage;
        if (speechUpdate.status) {
          setStatus(speechUpdate.status);
        }
      } else if (vapiMessage.role && vapiMessage.content) {
        // Handle standard message format
        const message: Message = {
          role: vapiMessage.role as "user" | "assistant" | "system",
          content: vapiMessage.content,
          timestamp,
        };
        setMessages((prev) => [...prev, message]);
      } else if (vapiMessage.message) {
        // Handle messages with 'message' field
        const message: Message = {
          role: (vapiMessage.role as "user" | "assistant") || "assistant",
          content: vapiMessage.message,
          timestamp,
        };
        setMessages((prev) => [...prev, message]);
      }
    };

    const handleVolumeLevel = (volume: number) => {
      const normalizedVolume = Math.max(0, Math.min(100, volume * 100));
      setVolumeLevel(normalizedVolume);
      // User is considered speaking if volume is above threshold
      setIsUserSpeaking(normalizedVolume > 10);
    };

    const handleSpeechStart = () => {
      setIsSpeaking(true);
      setStatus("Speaking");
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setStatus("Connected");
    };

    const handleCallStart = () => {
      setIsCallActive(true);
      setIsLoading(false);
      setError(null);
      setMessages([]);
      setTranscripts([]);
      setVolumeLevel(0);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      setStatus("Connected");
    };

    const handleCallEnd = () => {
      setIsCallActive(false);
      setIsLoading(false);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      setVolumeLevel(0);
      setStatus(null);
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setIsLoading(false);
      setIsCallActive(false);
    };

    vapi.on("message", handleMessage);
    vapi.on("volume-level", handleVolumeLevel);
    vapi.on("speech-start", handleSpeechStart);
    vapi.on("speech-end", handleSpeechEnd);
    vapi.on("call-start", handleCallStart);
    vapi.on("call-end", handleCallEnd);
    vapi.on("error", handleError);

    return () => {
      vapi.removeListener("message", handleMessage);
      vapi.removeListener("volume-level", handleVolumeLevel);
      vapi.removeListener("speech-start", handleSpeechStart);
      vapi.removeListener("speech-end", handleSpeechEnd);
      vapi.removeListener("call-start", handleCallStart);
      vapi.removeListener("call-end", handleCallEnd);
      vapi.removeListener("error", handleError);
      if (isCallActive) {
        vapi.stop();
      }
    };
  }, [isCallActive]);

  const call = async (assistantId: string) => {
    if (!vapiRef.current || isCallActive) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await vapiRef.current.start(assistantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (vapiRef.current && isCallActive) {
      vapiRef.current.stop();
    }
  };

  return {
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
  };
};

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

interface AudioData {
  buffer: ArrayBuffer;
  receivedAt: number;
}

interface CallOptions {
  customerNumber?: string;
  phoneNumberId?: string;
  usePhoneCall?: boolean; // If true, use phone call API (supports listen); if false, use web call SDK
}

interface UseVapiReturn {
  call: (assistantId: string, options?: CallOptions) => void;
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
  audioData: AudioData[];
  downloadAudio: () => void;
  isListening: boolean;
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
  const [audioData, setAudioData] = useState<AudioData[]>([]);
  const [isListening, setIsListening] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const isCallActiveRef = useRef(false);
  const listenWebSocketRef = useRef<WebSocket | null>(null);
  const audioBufferRef = useRef<ArrayBuffer[]>([]);
  const callIdRef = useRef<string | null>(null);
  const controlUrlRef = useRef<string | null>(null);

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
      console.log("Speech started");
      setIsSpeaking(true);
      setStatus("Speaking");
    };

    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setStatus("Connected");
    };

    const handleCallStart = () => {
      isCallActiveRef.current = true;
      setIsCallActive(true);
      setIsLoading(false);
      setError(null);
      setMessages([]);
      setTranscripts([]);
      setVolumeLevel(0);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      setStatus("Connected");
      // Clear audio buffer when call starts
      audioBufferRef.current = [];
      setAudioData([]);
    };

    const handleCallEnd = () => {
      isCallActiveRef.current = false;
      setIsCallActive(false);
      setIsLoading(false);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      setVolumeLevel(0);
      setStatus(null);
      setIsListening(false);
      
      // Close WebSocket connection if open
      if (listenWebSocketRef.current) {
        listenWebSocketRef.current.close();
        listenWebSocketRef.current = null;
      }
    };

    const handleError = (err: Error) => {
      isCallActiveRef.current = false;
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
      if (isCallActiveRef.current) {
        vapi.stop();
      }
      // Cleanup WebSocket connection
      if (listenWebSocketRef.current) {
        listenWebSocketRef.current.close();
        listenWebSocketRef.current = null;
      }
    };
  }, []);

  const connectToListenWebSocket = (listenUrl: string) => {
    try {
      const ws = new WebSocket(listenUrl);
      listenWebSocketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection to listen URL established");
        setIsListening(true);
        setStatus("Listening to audio stream");
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          // Binary PCM audio data
          const timestamp = Date.now();
          audioBufferRef.current.push(event.data);
          
          setAudioData((prev) => [
            ...prev,
            {
              buffer: event.data,
              receivedAt: timestamp,
            },
          ]);
        } else {
          // Text message (JSON)
          try {
            const message = JSON.parse(event.data as string);
            console.log("Received message from listen WebSocket:", message);
          } catch (err) {
            console.log("Received text from listen WebSocket:", event.data);
          }
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Failed to connect to audio stream");
        setIsListening(false);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setIsListening(false);
        listenWebSocketRef.current = null;
      };
    } catch (err) {
      console.error("Failed to create WebSocket:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to audio stream");
      setIsListening(false);
    }
  };

  const call = async (assistantId: string, options?: CallOptions) => {
    if (isCallActiveRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKey =
        process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ||
        process.env.NEXT_PUBLIC_VAPI_API_KEY;

      if (!apiKey) {
        throw new Error("Vapi API key is not set");
      }

      const usePhoneCall = options?.usePhoneCall ?? false;

      if (usePhoneCall) {
        // Use phone call API endpoint (supports Call Listen feature)
        if (!options?.customerNumber || !options?.phoneNumberId) {
          throw new Error(
            "Phone number and phone number ID are required for phone calls with listen feature"
          );
        }

        // Use Next.js API route to proxy the request and keep API key secure
        const response = await fetch("/api/vapi/call", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            assistantId,
            customer: {
              number: options.customerNumber,
            },
            phoneNumberId: options.phoneNumberId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `Failed to create call: ${response.statusText}`
          );
        }

        const callData = await response.json();
        callIdRef.current = callData.id;
        
        // Store control URL for call control features
        if (callData.monitor?.controlUrl) {
          controlUrlRef.current = callData.monitor.controlUrl;
        }

        // Connect to listen WebSocket if listenUrl is available
        if (callData.monitor?.listenUrl) {
          connectToListenWebSocket(callData.monitor.listenUrl);
        }

        // Trigger call-start manually for phone calls
        isCallActiveRef.current = true;
        setIsCallActive(true);
        setIsLoading(false);
        setError(null);
        setMessages([]);
        setTranscripts([]);
        setVolumeLevel(0);
        setIsSpeaking(false);
        setIsUserSpeaking(false);
        setStatus("Connected");
        // Clear audio buffer when call starts
        audioBufferRef.current = [];
        setAudioData([]);
      } else {
        // Use web call SDK (traditional approach, no listen feature)
        if (!vapiRef.current) {
          throw new Error("Vapi SDK not initialized");
        }
        await vapiRef.current.start(assistantId);
      }
    } catch (err) {
      isCallActiveRef.current = false;
      setError(err instanceof Error ? err.message : "Failed to start call");
      setIsLoading(false);
      setIsListening(false);
    }
  };

  const endCall = async () => {
    // Close WebSocket connection first
    if (listenWebSocketRef.current) {
      listenWebSocketRef.current.close();
      listenWebSocketRef.current = null;
    }

    // If we have a controlUrl, use it to end the phone call
    if (controlUrlRef.current && callIdRef.current) {
      try {
        // Use Next.js API route to proxy the request and keep API key secure
        await fetch("/api/vapi/control", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            controlUrl: controlUrlRef.current,
            action: { type: "end-call" },
          }),
        });
      } catch (err) {
        console.error("Failed to end call via control URL:", err);
      }
      controlUrlRef.current = null;
      callIdRef.current = null;
    }

    // Stop web call if using SDK
    if (vapiRef.current && isCallActiveRef.current) {
      vapiRef.current.stop();
    }
  };

  const downloadAudio = () => {
    if (audioBufferRef.current.length === 0) {
      alert("No audio data available to download");
      return;
    }

    // Combine all audio buffers into one
    const totalLength = audioBufferRef.current.reduce(
      (sum, buffer) => sum + buffer.byteLength,
      0
    );
    const combinedBuffer = new ArrayBuffer(totalLength);
    const combinedView = new Uint8Array(combinedBuffer);

    let offset = 0;
    for (const buffer of audioBufferRef.current) {
      combinedView.set(new Uint8Array(buffer), offset);
      offset += buffer.byteLength;
    }

    // Create a Blob and download link
    const blob = new Blob([combinedBuffer], { type: "audio/pcm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vapi-audio-${Date.now()}.pcm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    audioData,
    downloadAudio,
    isListening,
  };
};

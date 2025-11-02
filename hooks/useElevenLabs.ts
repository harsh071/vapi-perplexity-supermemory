"use client";

/**
 * ElevenLabs Integration Hook
 * 
 * NOTE: This is a simplified browser implementation using direct API calls.
 * The ElevenLabs JS SDK is designed for Node.js environments and cannot be
 * used directly in the browser due to its Node.js dependencies.
 * 
 * This implementation uses:
 * - Fetch API for REST calls to ElevenLabs API
 * - Native WebRTC API for real-time audio
 * 
 * For complete WebRTC implementation, refer to ElevenLabs documentation.
 */

import { useEffect, useState, useRef } from "react";

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

interface AudioData {
  buffer: ArrayBuffer;
  receivedAt: number;
}

export const useElevenLabs = (): UseElevenLabsReturn => {
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

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const isCallActiveRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioBufferRef = useRef<ArrayBuffer[]>([]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

    if (!apiKey) {
      setError(
        "ElevenLabs API key is not set. Please add NEXT_PUBLIC_ELEVENLABS_API_KEY to your .env.local file"
      );
    }
  }, []);

  const updateVolumeLevel = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Calculate average volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const average = sum / bufferLength;
    const normalizedVolume = Math.max(0, Math.min(100, average * 2));

    setVolumeLevel(normalizedVolume);
    setIsUserSpeaking(normalizedVolume > 10);
  };

  const call = async (agentId: string) => {
    if (isCallActiveRef.current) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;

      if (!apiKey) {
        throw new Error("ElevenLabs API key is not set");
      }

      // Get WebRTC token using direct API call
      const tokenResponse = await fetch(
        "https://api.elevenlabs.io/v1/convai/conversation/webrtc/token",
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agentId,
            participantName: `user_${Date.now()}`,
          }),
        }
      );

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to get WebRTC token: ${tokenResponse.statusText}`
        );
      }

      const { token } = await tokenResponse.json();

      // Create RTCPeerConnection
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      // Set up audio context and analyser for volume detection
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      mediaStreamRef.current = stream;

      // Connect microphone to analyser for volume detection
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      // Start volume monitoring
      setInterval(updateVolumeLevel, 50);

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle incoming audio
      pc.ontrack = (event) => {
        const [remoteStream] = event.streams;
        const audioElement = new Audio();
        audioElement.srcObject = remoteStream;
        audioElement.play();
        
        // Create analyser for incoming audio
        const remoteAudioContext = new AudioContext();
        const remoteSource = remoteAudioContext.createMediaStreamSource(remoteStream);
        const remoteAnalyser = remoteAudioContext.createAnalyser();
        remoteAnalyser.fftSize = 256;
        remoteSource.connect(remoteAnalyser);

        const checkRemoteVolume = () => {
          const bufferLength = remoteAnalyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          remoteAnalyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / bufferLength;
          setIsSpeaking(average > 5);
          if (audioContextRef.current?.state !== "closed") {
            requestAnimationFrame(checkRemoteVolume);
          }
        };
        checkRemoteVolume();
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        if (state === "connected") {
          setStatus("Connected");
        } else if (state === "disconnected" || state === "failed") {
          setStatus("Disconnected");
          endCall();
        }
      };

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      // NOTE: WebRTC signaling implementation is incomplete
      // In production, you would:
      // 1. Connect to ElevenLabs WebRTC signaling server using the token
      // 2. Exchange offer/answer with the signaling server
      // 3. Handle ICE candidates
      
      console.log("WebRTC connection setup - signaling implementation needed");
      console.log("Token:", token);

      // Mark as connected
      isCallActiveRef.current = true;
      setIsCallActive(true);
      setIsLoading(false);
      setStatus("Connected (Demo Mode)");
      setMessages([]);
      setTranscripts([]);
      setVolumeLevel(0);
      setIsSpeaking(false);
      setIsUserSpeaking(false);
      audioBufferRef.current = [];
      setAudioData([]);

    } catch (err) {
      isCallActiveRef.current = false;
      setError(err instanceof Error ? err.message : "Failed to start call");
      setIsLoading(false);
      setIsCallActive(false);
    }
  };

  const endCall = () => {
    isCallActiveRef.current = false;
    setIsCallActive(false);
    setIsLoading(false);
    setIsSpeaking(false);
    setIsUserSpeaking(false);
    setVolumeLevel(0);
    setStatus(null);
    setIsListening(false);

    // Close WebRTC connection
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      analyserRef.current = null;
    }

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const downloadAudio = () => {
    if (audioBufferRef.current.length === 0) {
      alert("No audio data available to download");
      return;
    }

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

    const blob = new Blob([combinedBuffer], { type: "audio/pcm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `elevenlabs-audio-${Date.now()}.pcm`;
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

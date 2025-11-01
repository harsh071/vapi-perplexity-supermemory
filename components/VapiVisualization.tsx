"use client";

import { useEffect, useRef } from "react";
import type { TranscriptMessage } from "@/hooks/useVapi";

interface VapiVisualizationProps {
  transcripts: TranscriptMessage[];
  volumeLevel: number;
  isSpeaking: boolean;
}

export const VapiVisualization = ({
  transcripts,
  volumeLevel,
  isSpeaking,
}: VapiVisualizationProps) => {
  const volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (volumeBarRef.current) {
      volumeBarRef.current.style.width = `${volumeLevel}%`;
    }
  }, [volumeLevel]);

  return (
    <div className="space-y-6">
      {/* Volume Level Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Audio Visualization</h3>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400"
              }`}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {isSpeaking ? "Speaking" : "Listening"}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Volume Level</span>
            <span>{Math.round(volumeLevel)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              ref={volumeBarRef}
              className={`h-full transition-all duration-100 ease-out rounded-full ${
                volumeLevel > 70
                  ? "bg-red-500"
                  : volumeLevel > 40
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${volumeLevel}%` }}
            />
          </div>
        </div>

        {/* Volume waveform visualization */}
        <div className="mt-4 flex items-center justify-center gap-1 h-12">
          {Array.from({ length: 20 }).map((_, i) => {
            const barHeight =
              volumeLevel > 0
                ? Math.random() * (volumeLevel / 5) + 5
                : 2;
            return (
              <div
                key={i}
                className={`w-1 bg-blue-500 rounded-t transition-all duration-75 ${
                  isSpeaking ? "animate-pulse" : ""
                }`}
                style={{
                  height: `${barHeight}px`,
                  opacity: volumeLevel > 0 ? 0.6 + volumeLevel / 200 : 0.3,
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Transcripts Visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Live Transcripts</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transcripts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              Transcripts will appear here as the conversation progresses...
            </p>
          ) : (
            transcripts.map((transcript, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  transcript.role === "user"
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500"
                    : "bg-purple-50 dark:bg-purple-900/20 border-purple-500"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                      transcript.role === "user"
                        ? "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200"
                        : "bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200"
                    }`}
                  >
                    {transcript.role === "user" ? "You" : "Assistant"}
                  </span>
                  {transcript.timestamp && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transcript.timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200">
                  {transcript.transcript}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Route for ElevenLabs WebRTC Token
 * This route fetches WebRTC tokens from ElevenLabs, keeping API keys secure on the server
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Fetch WebRTC token from ElevenLabs
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversation/webrtc/token",
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail?.message || "Failed to get ElevenLabs token", data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("ElevenLabs API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


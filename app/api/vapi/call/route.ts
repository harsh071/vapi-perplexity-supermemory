import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Route for Vapi Phone Calls
 * This route proxies requests to Vapi API, keeping API keys secure on the server
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.VAPI_API_KEY || process.env.VAPI_PUBLIC_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Vapi API key is not configured on the server" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Forward the request to Vapi API
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to create Vapi call", data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Vapi API error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


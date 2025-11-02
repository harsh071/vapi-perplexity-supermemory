import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Route for Vapi Call Control
 * This route proxies call control requests to Vapi API
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

    const { controlUrl, action } = await request.json();

    if (!controlUrl) {
      return NextResponse.json(
        { error: "Control URL is required" },
        { status: 400 }
      );
    }

    // Forward the request to Vapi control URL
    const response = await fetch(controlUrl, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(action || { type: "end-call" }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Failed to control call", data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Vapi control error:", error);
    return NextResponse.json(
      {
        error: "Failed to process control request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


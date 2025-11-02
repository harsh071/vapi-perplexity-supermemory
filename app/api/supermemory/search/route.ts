import { NextRequest, NextResponse } from "next/server";
import Supermemory from "supermemory";

/**
 * Next.js API Route for Supermemory Search
 * This route provides a secure server-side proxy for Supermemory document search
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SUPERMEMORY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Supermemory API key is not configured on the server" },
        { status: 500 }
      );
    }

    const { query, limit = 10 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Initialize Supermemory client
    const client = new Supermemory({ apiKey });

    // Perform document search
    const response = await client.search.documents({ 
      q: String(query),
      limit,
    });

    // Format the response
    if (!response.results || response.results.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No documents found",
        results: [],
      });
    }

    // Return formatted results
    return NextResponse.json({
      success: true,
      results: response.results.map((result: any) => ({
        id: result.id,
        title: result.title,
        content: result.content,
        metadata: result.metadata,
        relevance_score: result.relevance_score,
      })),
    });
  } catch (error) {
    console.error("Supermemory search error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Route for Perplexity Search
 * This route provides a secure server-side proxy for Perplexity search API
 * Can be called by Vapi voice assistant as a function/tool
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Perplexity API key is not configured on the server" },
        { status: 500 }
      );
    }

    const { query, max_results = 5, search_depth = "advanced" } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    // Call Perplexity Search API directly
    const response = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: String(query),
        max_results,
        search_depth,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Perplexity API error: ${response.statusText}`);
    }

    const searchResponse = await response.json();

    // Format the response for Vapi function calls
    if (!searchResponse.results || searchResponse.results.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No search results found",
        results: [],
      });
    }

    // Return formatted results
    return NextResponse.json({
      success: true,
      results: searchResponse.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.snippet,
      })),
    });
  } catch (error) {
    console.error("Perplexity search error:", error);
    return NextResponse.json(
      {
        error: "Failed to perform search",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


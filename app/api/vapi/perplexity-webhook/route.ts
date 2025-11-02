import { NextRequest, NextResponse } from "next/server";

/**
 * Vapi Webhook Endpoint for Perplexity Search Function
 * This endpoint is called by Vapi when the assistant needs to perform a search
 * Responds in the format expected by Vapi's function calling system
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Perplexity API key is not configured" },
        { status: 500 }
      );
    }

    // Parse the Vapi function call request
    const requestBody = await request.json();
    
    // Extract the search query from Vapi's function call
    // Vapi typically sends: { query: "search term", parameters: { ... }, etc }
    const query = requestBody.query || requestBody.parameters?.query || requestBody.message?.query;

    if (!query) {
      return NextResponse.json({
        result: "Error: No search query provided. Please provide a query parameter.",
      });
    }

    console.log("Performing Perplexity search for:", query);

    // Call Perplexity Search API directly
    const response = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: String(query),
        max_results: 5,
        search_depth: "advanced",
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Perplexity API error:", errorData);
      return NextResponse.json({
        result: "I'm sorry, I encountered an error while searching. Please try again.",
        error: errorData.message || "Unknown error",
      });
    }

    const searchResponse = await response.json();

    // Format results for voice response
    if (!searchResponse.results || searchResponse.results.length === 0) {
      return NextResponse.json({
        result: "I couldn't find any results for that search query. Could you try rephrasing your question?",
      });
    }

    // Create a concise summary suitable for voice
    const topResults = searchResponse.results.slice(0, 3);
    let summary = "Here's what I found:\n\n";
    
    topResults.forEach((result: any, index: number) => {
      summary += `${index + 1}. ${result.title}\n${result.snippet}\n\n`;
    });

    // Return formatted result for Vapi to speak
    return NextResponse.json({
      result: summary.trim(),
      sources: topResults.map((r: any) => ({ title: r.title, url: r.url })),
    });
  } catch (error) {
    console.error("Perplexity webhook error:", error);
    return NextResponse.json({
      result: "I'm sorry, I encountered an error while searching. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


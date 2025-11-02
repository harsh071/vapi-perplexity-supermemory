import { NextRequest, NextResponse } from "next/server";
import Supermemory from "supermemory";

/**
 * Vapi Webhook Endpoint for Supermemory Search Function
 * This endpoint is called by Vapi when the assistant needs to search documents
 * Responds in the format expected by Vapi's function calling system
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.SUPERMEMORY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Supermemory API key is not configured" },
        { status: 500 }
      );
    }

    // Parse the Vapi function call request
    const requestBody = await request.json();
    
    // Extract the search query
    const query = requestBody.query || requestBody.parameters?.query || requestBody.message?.query;

    if (!query) {
      return NextResponse.json({
        result: "Error: No search query provided. Please provide a query parameter.",
      });
    }

    console.log("Performing Supermemory search for:", query);

    // Initialize Supermemory client
    const client = new Supermemory({ apiKey });

    // Perform search with optimized settings for voice responses
    const response = await client.search.documents({
      q: String(query),
      limit: 5,
    });

    // Format results for voice response
    if (!response.results || response.results.length === 0) {
      return NextResponse.json({
        result: "I couldn't find any documents matching that query. Could you try rephrasing your question?",
      });
    }

    // Create a concise summary suitable for voice
    const topResults = response.results.slice(0, 3);
    let summary = "Here's what I found in my documents:\n\n";
    
    topResults.forEach((result: any, index: number) => {
      summary += `${index + 1}. ${result.title || 'Document'}\n${result.content?.substring(0, 200)}...\n\n`;
    });

    // Return formatted result for Vapi to speak
    return NextResponse.json({
      result: summary.trim(),
      sources: topResults.map((r: any) => ({ 
        title: r.title || 'Document', 
        id: r.id 
      })),
    });
  } catch (error) {
    console.error("Supermemory webhook error:", error);
    return NextResponse.json({
      result: "I'm sorry, I encountered an error while searching documents. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


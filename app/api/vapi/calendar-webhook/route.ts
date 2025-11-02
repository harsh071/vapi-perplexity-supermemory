import { NextRequest, NextResponse } from "next/server";

/**
 * Vapi Webhook Endpoint for Google Calendar Function
 * This endpoint is called by Vapi when the assistant needs to interact with calendar
 * Responds in the format expected by Vapi's function calling system
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Calendar access token is not configured" },
        { status: 500 }
      );
    }

    // Parse the Vapi function call request
    const requestBody = await request.json();
    
    // Extract action and parameters
    const action = requestBody.action || requestBody.parameters?.action;
    const eventData = requestBody.eventData || requestBody.parameters?.eventData;
    const calendarId = requestBody.calendarId || requestBody.parameters?.calendarId || "primary";

    if (!action) {
      return NextResponse.json({
        result: "Error: No action specified. Please provide an action (list, create, get, delete).",
      });
    }

    console.log("Processing calendar action:", action);

    let response: Response | undefined;
    let result: string | undefined;

    switch (action) {
      case "list":
        // List upcoming events
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=5&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            result = "Here are your upcoming events:\n\n";
            data.items.forEach((event: any, index: number) => {
              const summary = event.summary || "No title";
              const start = event.start?.dateTime || event.start?.date;
              result += `${index + 1}. ${summary} - ${start}\n`;
            });
          } else {
            result = "You have no upcoming events.";
          }
        }
        break;

      case "create":
        // Create new event
        if (!eventData || !eventData.summary) {
          return NextResponse.json({
            result: "Error: Event summary is required to create an event.",
          });
        }

        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          result = `Event "${data.summary}" has been created successfully. It starts at ${data.start?.dateTime || data.start?.date}.`;
        }
        break;

      case "get":
        // Get specific event
        const eventId = eventData?.eventId || requestBody.parameters?.eventId;
        if (!eventId) {
          return NextResponse.json({
            result: "Error: Event ID is required to get an event.",
          });
        }

        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          result = `Event: ${data.summary}\nStart: ${data.start?.dateTime || data.start?.date}\nEnd: ${data.end?.dateTime || data.end?.date}`;
          if (data.description) {
            result += `\nDescription: ${data.description}`;
          }
        }
        break;

      default:
        return NextResponse.json({
          result: `Error: Invalid action "${action}". Supported actions are: list, create, get, delete.`,
        });
    }

    if (!response) {
      return NextResponse.json({
        result: "Error: Failed to process calendar request.",
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Google Calendar API error:", errorData);
      return NextResponse.json({
        result: "I'm sorry, I encountered an error while accessing your calendar. Please try again.",
        error: errorData.error?.message || "Unknown error",
      });
    }

    // Return formatted result for Vapi to speak
    return NextResponse.json({
      result: result || "Calendar operation completed successfully.",
    });
  } catch (error) {
    console.error("Calendar webhook error:", error);
    return NextResponse.json({
      result: "I'm sorry, I encountered an error while accessing your calendar. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}


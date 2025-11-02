import { NextRequest, NextResponse } from "next/server";

/**
 * Next.js API Route for Google Calendar Events
 * This route provides a secure server-side proxy for Google Calendar operations
 */
export async function POST(request: NextRequest) {
  try {
    const accessToken = process.env.GOOGLE_CALENDAR_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google Calendar access token is not configured on the server" },
        { status: 500 }
      );
    }

    const { action, calendarId = "primary", eventData, maxResults = 10 } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: "Action is required (list, get, create, update, delete)" },
        { status: 400 }
      );
    }

    let response;

    switch (action) {
      case "list":
        // List upcoming events
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?maxResults=${maxResults}&orderBy=startTime&singleEvents=true&timeMin=${new Date().toISOString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        break;

      case "get":
        // Get specific event
        if (!eventData?.eventId) {
          return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }
        response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${eventData.eventId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        break;

      case "create":
        // Create new event
        if (!eventData) {
          return NextResponse.json({ error: "Event data is required" }, { status: 400 });
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
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Google Calendar API error: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Google Calendar error:", error);
    return NextResponse.json(
      {
        error: "Failed to process calendar request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


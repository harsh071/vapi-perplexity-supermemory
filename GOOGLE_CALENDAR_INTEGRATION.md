# Google Calendar Integration

## Overview

This integration adds Google Calendar functionality to your Vapi voice assistant. When users need to check, create, or manage calendar events, your assistant can now interact with their Google Calendar seamlessly.

## Features

- 📅 **List Events** - Get upcoming events from calendar
- ✨ **Create Events** - Add new events to calendar
- 🔍 **Get Event Details** - Retrieve specific event information
- 🗑️ **Delete Events** - Remove events from calendar
- 🎙️ **Voice-Optimized Responses** - Natural language answers perfect for audio

## Setup Instructions

### 1. Get Google Calendar Access

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create credentials (OAuth 2.0 Client ID)
5. Set up OAuth consent screen
6. Generate an access token with calendar scopes: `https://www.googleapis.com/auth/calendar`

### 2. Add to Environment Variables

Add to your `.env.local` file:

```env
GOOGLE_CALENDAR_ACCESS_TOKEN=your_google_calendar_access_token_here
```

### 3. Configure Vapi Assistant

To enable calendar functionality in your Vapi assistant, you need to add functions:

#### Via Vapi Dashboard

**Function 1: List Events**
1. Go to your [Vapi Dashboard](https://dashboard.vapi.ai)
2. Select or create an Assistant
3. Navigate to "Server URL" or "Functions" section
4. Add a new function:
   - **Name**: `list_calendar_events` or `show_upcoming_events`
   - **Server URL**: `https://your-domain.com/api/vapi/calendar-webhook`
   - **Function Description**: `List upcoming calendar events. Use this when the user asks about their schedule or upcoming events.`
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "action": {
           "type": "string",
           "description": "Action to perform: list"
         }
       },
       "required": ["action"]
     }
     ```

**Function 2: Create Event**
1. Add another function:
   - **Name**: `create_calendar_event` or `add_event`
   - **Server URL**: `https://your-domain.com/api/vapi/calendar-webhook`
   - **Function Description**: `Create a new calendar event. Use this when the user wants to schedule something.`
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "action": {
           "type": "string",
           "description": "Action: create"
         },
         "eventData": {
           "type": "object",
           "properties": {
             "summary": {
               "type": "string",
               "description": "Event title"
             },
             "description": {
               "type": "string",
               "description": "Event description"
             },
             "start": {
               "type": "object",
               "properties": {
                 "dateTime": {
                   "type": "string",
                   "description": "ISO 8601 datetime"
                 }
               }
             },
             "end": {
               "type": "object",
               "properties": {
                 "dateTime": {
                   "type": "string",
                   "description": "ISO 8601 datetime"
                 }
               }
             }
           },
           "required": ["summary"]
         }
       },
       "required": ["action", "eventData"]
     }
     ```

### 4. Deploy Your Application

If testing locally, you'll need to expose your local server using ngrok.

## Usage Examples

### List Upcoming Events
**User**: "What's on my calendar today?"
**Assistant**: *list events* → *speaks upcoming events*

### Create Event
**User**: "Schedule a meeting with John tomorrow at 2pm"
**Assistant**: *creates event* → *confirms creation*

### Get Event Details
**User**: "Tell me about my 3pm meeting"
**Assistant**: *gets event* → *speaks details*

## API Endpoints

### POST /api/calendar/events

General-purpose calendar endpoint for direct API calls.

**List Events:**
```json
{
  "action": "list",
  "calendarId": "primary",
  "maxResults": 10
}
```

**Create Event:**
```json
{
  "action": "create",
  "calendarId": "primary",
  "eventData": {
    "summary": "Team Meeting",
    "description": "Discuss Q4 strategy",
    "start": {
      "dateTime": "2024-12-20T14:00:00Z"
    },
    "end": {
      "dateTime": "2024-12-20T15:00:00Z"
    }
  }
}
```

**Get Event:**
```json
{
  "action": "get",
  "calendarId": "primary",
  "eventData": {
    "eventId": "abc123"
  }
}
```

### POST /api/vapi/calendar-webhook

Vapi function call webhook handler.

## Supported Actions

### list
Lists upcoming events from the calendar.

### create
Creates a new calendar event with provided details.

### get
Retrieves details of a specific event by ID.

## Troubleshooting

### "Google Calendar access token is not configured"
- Check that `GOOGLE_CALENDAR_ACCESS_TOKEN` is set in `.env.local`
- Restart your development server after adding the token

### "Invalid credentials" Error
- Verify your OAuth token is valid
- Check token hasn't expired
- Ensure token has correct scopes: `https://www.googleapis.com/auth/calendar`

### "API not enabled" Error
- Enable Google Calendar API in Google Cloud Console
- Ensure billing is enabled on your project

### Webhook Not Being Called
- Verify the webhook URL is correctly configured in Vapi dashboard
- Ensure your server is publicly accessible
- Check Vapi dashboard logs for webhook errors

### Permissions Issues
- Ensure OAuth consent screen is configured
- Verify user has granted necessary permissions
- Check calendar access permissions in Google account

## Security

✅ **Server-Side Only**: Access token never exposed to the browser  
✅ **Environment Variables**: Secure credential management  
✅ **Input Validation**: All requests are validated  
✅ **Error Handling**: Graceful failures with user-friendly messages  

## Google Calendar API Limits

- **Queries per day**: 1,000,000 (free tier)
- **Queries per 100 seconds**: 1000 per user
- **Queries per 100 seconds**: 10,000 per project

## Event Format

Events use Google Calendar API format:

```json
{
  "summary": "Meeting Title",
  "description": "Meeting description",
  "start": {
    "dateTime": "2024-12-20T14:00:00Z",
    "timeZone": "America/New_York"
  },
  "end": {
    "dateTime": "2024-12-20T15:00:00Z",
    "timeZone": "America/New_York"
  },
  "location": "Conference Room A",
  "attendees": [
    {"email": "user@example.com"}
  ]
}
```

## References

- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [OAuth 2.0 Setup Guide](https://developers.google.com/identity/protocols/oauth2)
- [Vapi Functions Documentation](https://docs.vapi.ai)


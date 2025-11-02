# Supermemory Integration

## Overview

This integration adds Supermemory's powerful document search capabilities to your Vapi voice assistant. When users ask questions about documents, your assistant can now search through your uploaded documents and provide relevant answers.

## Features

- 📚 **Document Search** - Search through your uploaded documents
- 🎙️ **Voice-Optimized Responses** - Formatted results perfect for spoken responses
- 🔒 **Secure Server-Side** - API keys protected on the server
- ⚡ **Fast & Reliable** - Optimized for conversational AI workflows

## Setup Instructions

### 1. Get Your Supermemory API Key

1. Visit [Supermemory](https://supermemory.ai)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 2. Add to Environment Variables

Add to your `.env.local` file:

```env
SUPERMEMORY_API_KEY=your_supermemory_api_key_here
```

### 3. Configure Vapi Assistant

To enable document search functionality in your Vapi assistant, you need to add a Server URL function:

#### Via Vapi Dashboard

1. Go to your [Vapi Dashboard](https://dashboard.vapi.ai)
2. Select or create an Assistant
3. Navigate to "Server URL" or "Functions" section
4. Add a new function/tool with:
   - **Name**: `search_documents` or `find_document`
   - **Server URL**: `https://your-domain.com/api/vapi/supermemory-webhook`
   - **Function Description**: `Search through uploaded documents and knowledge base. Use this when you need to find information from your document library.`
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "query": {
           "type": "string",
           "description": "The search query or question to find in documents"
         }
       },
       "required": ["query"]
     }
     ```

### 4. Deploy Your Application

If testing locally, you'll need to expose your local server using ngrok.

## Usage Examples

### Basic Document Search
**User**: "What did we say about the quarterly strategy?"
**Assistant**: *searches documents* → *speaks relevant excerpts*

### Knowledge Base Queries
**User**: "Find information about the new product launch"
**Assistant**: *searches documents* → *provides relevant information*

## API Endpoints

### POST /api/supermemory/search

General-purpose search endpoint for direct API calls.

**Request:**
```json
{
  "query": "information about Q4 strategy",
  "limit": 10
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "id": "doc_123",
      "title": "Q4 Strategy Document",
      "content": "The quarterly strategy focuses on...",
      "relevance_score": 0.95
    }
  ]
}
```

### POST /api/vapi/supermemory-webhook

Vapi function call webhook handler.

**Request** (from Vapi):
```json
{
  "query": "search term",
  "parameters": {
    "query": "what is in the document?"
  }
}
```

**Response** (formatted for voice):
```json
{
  "result": "Here's what I found in my documents:\n\n1. Document Title\nContent snippet...",
  "sources": [
    { "title": "Document Title", "id": "doc_123" }
  ]
}
```

## Testing

### Test the Search Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/supermemory/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "quarterly strategy"
  }'
```

### Test with Vapi Assistant

1. Start a call with your assistant
2. Ask a question about your documents
3. The assistant should automatically search and respond

## Troubleshooting

### "Supermemory API key is not configured"
- Check that `SUPERMEMORY_API_KEY` is set in `.env.local`
- Restart your development server after adding the key

### "No documents found"
- Ensure documents are uploaded to your Supermemory account
- Try rephrasing your query
- Check your Supermemory account has sufficient credits

### Webhook Not Being Called
- Verify the webhook URL is correctly configured in Vapi dashboard
- Ensure your server is publicly accessible
- Check Vapi dashboard logs for webhook errors

## Pricing

Check [Supermemory Pricing](https://supermemory.ai/pricing) for latest details.

## Security

✅ **Server-Side Only**: API key never exposed to the browser  
✅ **Environment Variables**: Secure credential management  
✅ **Input Validation**: All queries are sanitized and validated  
✅ **Error Handling**: Graceful failures with user-friendly messages  

## References

- [Supermemory Documentation](https://docs.supermemory.ai)
- [Vapi Functions Documentation](https://docs.vapi.ai)


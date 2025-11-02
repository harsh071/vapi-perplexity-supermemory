# Perplexity Search Integration

## Overview

This integration adds Perplexity's powerful web search capabilities to your Vapi voice assistant. When users ask questions that require real-time information, your assistant can now search the web and provide up-to-date answers.

## Features

- 🔍 **Real-time Web Search** - Access to Perplexity's extensive web index
- 🎙️ **Voice-Optimized Responses** - Formatted results perfect for spoken responses
- 🔒 **Secure Server-Side** - API keys protected on the server
- ⚡ **Fast & Reliable** - Optimized for conversational AI workflows
- 📊 **Advanced Search** - Deep search capabilities for comprehensive answers

## Architecture

```
User Question → Vapi Assistant → Webhook Function → Perplexity API → Formatted Response → Vapi → User
```

The integration consists of two main API routes:
1. **`/api/perplexity/search`** - General-purpose search endpoint
2. **/api/vapi/perplexity-webhook** - Vapi function call handler (webhook)

## Setup Instructions

### 1. Get Your Perplexity API Key

1. Visit [Perplexity API Platform](https://www.perplexity.ai/api-platform)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key

### 2. Add to Environment Variables

Add to your `.env.local` file:

```env
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

### 3. Configure Vapi Assistant

To enable search functionality in your Vapi assistant, you need to add a Server URL function:

#### Option A: Via Vapi Dashboard

1. Go to your [Vapi Dashboard](https://dashboard.vapi.ai)
2. Select or create an Assistant
3. Navigate to "Server URL" or "Functions" section
4. Add a new function/tool with:
   - **Name**: `search_web` or `perform_search`
   - **Server URL**: `https://your-domain.com/api/vapi/perplexity-webhook`
   - **Function Description**: `Search the web for real-time information. Use this when you need current or factual information that you don't have in your training data.`
   - **Parameters**:
     ```json
     {
       "type": "object",
       "properties": {
         "query": {
           "type": "string",
           "description": "The search query or question to find information about"
         }
       },
       "required": ["query"]
     }
     ```

#### Option B: Via API

```bash
curl -X PATCH https://api.vapi.ai/assistant/{assistant_id} \
  -H "Authorization: Bearer YOUR_VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "serverUrl": "https://your-domain.com/api/vapi/perplexity-webhook",
    "functions": [
      {
        "type": "function",
        "function": {
          "name": "search_web",
          "description": "Search the web for real-time information",
          "parameters": {
            "type": "object",
            "properties": {
              "query": {
                "type": "string",
                "description": "The search query or question"
              }
            },
            "required": ["query"]
          }
        }
      }
    ]
  }'
```

### 4. Deploy Your Application

If testing locally, you'll need to expose your local server:

**Using ngrok:**
```bash
ngrok http 3000
```

Then use the ngrok URL in your Vapi assistant configuration:
```
https://your-ngrok-url.ngrok.io/api/vapi/perplexity-webhook
```

## Usage Examples

### Basic Question
**User**: "What's the weather like today?"
**Assistant**: *calls search function* → *speaks weather information*

### Current Events
**User**: "Tell me the latest news about AI"
**Assistant**: *searches for latest AI news* → *provides updated information*

### Factual Queries
**User**: "What's the population of Tokyo?"
**Assistant**: *searches for current statistics* → *gives answer with source*

## API Endpoints

### POST /api/perplexity/search

General-purpose search endpoint for direct API calls.

**Request:**
```json
{
  "query": "latest developments in quantum computing",
  "max_results": 5,
  "search_depth": "advanced"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "title": "Quantum Computing Breakthrough",
      "url": "https://example.com/article",
      "snippet": "Recent advances in..."
    }
  ]
}
```

### POST /api/vapi/perplexity-webhook

Vapi function call webhook handler.

**Request** (from Vapi):
```json
{
  "query": "search query",
  "parameters": {
    "query": "what is AI?"
  }
}
```

**Response** (formatted for voice):
```json
{
  "result": "Here's what I found:\n\n1. Title\nSnippet text...\n\n2. Title\nSnippet text...",
  "sources": [
    { "title": "Article Title", "url": "https://example.com" }
  ]
}
```

## Configuration Options

### Search Depth

The integration supports two search modes:

- **`advanced`** (default): Deeper, more comprehensive results. Takes longer but provides better quality.
- **`basic`**: Faster results for quick queries. Use for simple factual questions.

You can adjust this in the API route or pass it as a parameter.

### Max Results

Control how many results to return:
- Default: `5`
- Recommended for voice: 3-5 results
- Recommended for visual: 10-20 results

## Testing

### Test the Search Endpoint Directly

```bash
curl -X POST http://localhost:3000/api/perplexity/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "latest news about artificial intelligence"
  }'
```

### Test with Vapi Assistant

1. Start a call with your assistant
2. Ask a question that requires web search
3. The assistant should automatically search and respond with current information

## Troubleshooting

### "Perplexity API key is not configured"
- Check that `PERPLEXITY_API_KEY` is set in `.env.local`
- Restart your development server after adding the key
- Ensure the key is valid and has proper permissions

### "No search results found"
- Try rephrasing your query
- Check your Perplexity account has sufficient credits
- Verify the API key is working correctly

### Webhook Not Being Called
- Verify the webhook URL is correctly configured in Vapi dashboard
- Ensure your server is publicly accessible (use ngrok for local dev)
- Check Vapi dashboard logs for webhook errors
- Verify the function is enabled in your assistant configuration

### Slow Responses
- Switch to `basic` search_depth for faster results
- Reduce `max_results` to 3
- Check your server's network connection
- Consider caching frequent queries

## Pricing

Perplexity Search API pricing:
- **$5 per 1,000 requests**
- No additional token fees for search API calls
- Pay-as-you-go model
- Free tier available for testing

Refer to [Perplexity Pricing](https://www.perplexity.ai/api-platform/pricing) for latest details.

## Security

✅ **Server-Side Only**: API key never exposed to the browser  
✅ **Environment Variables**: Secure credential management  
✅ **Input Validation**: All queries are sanitized and validated  
✅ **Error Handling**: Graceful failures with user-friendly messages  
✅ **Rate Limiting**: Consider implementing rate limits for production  

## Advanced Features

### Custom Response Formatting

You can customize how results are formatted in `/api/vapi/perplexity-webhook` to match your assistant's personality:

```typescript
// Example: More conversational formatting
const summary = `I found some interesting information about "${query}":\n\n${results.map((r, i) => 
  `According to ${r.title}, ${r.snippet}`
).join('\n\n')}`;
```

### Cache Frequently Asked Questions

Implement caching for common queries to reduce API costs:

```typescript
import NodeCache from 'node-cache';
const cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache

// Check cache before searching
const cached = cache.get(query);
if (cached) return NextResponse.json(cached);
```

### Multi-Query Search

Handle complex queries that benefit from multiple searches:

```typescript
const queries = splitComplexQuery(userQuery);
const results = await Promise.all(queries.map(q => search(q)));
const combined = mergeResults(results);
```

## Next Steps

- [ ] Test the integration with your Vapi assistant
- [ ] Configure additional search functions if needed
- [ ] Monitor API usage and costs
- [ ] Add caching for production use
- [ ] Implement rate limiting
- [ ] Customize response formatting

## References

- [Perplexity API Documentation](https://docs.perplexity.ai)
- [Perplexity Search Guide](https://docs.perplexity.ai/guides/search-guide)
- [Vapi Functions Documentation](https://docs.vapi.ai)
- [Vapi Webhooks Guide](https://docs.vapi.ai/webhooks)

## Support

For issues related to:
- **This integration**: Check this document and review implementation
- **Perplexity API**: Contact [Perplexity Support](https://perplexity.ai/support)
- **Vapi**: Visit [Vapi Documentation](https://docs.vapi.ai) or [Discord](https://discord.gg/vapi)


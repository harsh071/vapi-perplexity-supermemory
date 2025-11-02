# Environment Variables Template

Copy this configuration to a file named `.env.local` in the root directory and fill in your actual API keys.

## Important Security Notes

⚠️ **NEVER commit `.env.local` to version control!**

Keys prefixed with `NEXT_PUBLIC_` are embedded in the client bundle and exposed to browsers.
Use public keys with limited permissions for these.

Server-side keys (without `NEXT_PUBLIC_`) are only used in API routes and never exposed.

```env
# ============================================
# Vapi Configuration
# ============================================
# For web-based voice calls, you need the PUBLIC key (exposed to browser)
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here

# For phone calls through API routes, you can use the API key (stays on server)
VAPI_API_KEY=your_vapi_api_key_here

# Optional: Assistant ID to auto-load in the UI
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# Optional: Phone Number ID for phone call features
NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID=your_vapi_phone_number_id_here

# ============================================
# ElevenLabs Configuration
# ============================================
# For web calls using the React SDK, key is exposed to browser
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# For WebRTC token generation, use server-side key (if implementing custom flow)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Optional: Agent ID to auto-load in the UI
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here

# ============================================
# Perplexity Configuration
# ============================================
# For search functionality via Vapi assistant
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

## How API Keys Are Used

### Vapi
- **Client-side (Web SDK)**: `NEXT_PUBLIC_VAPI_PUBLIC_KEY` - Required for WebRTC calls using the Vapi SDK
- **Server-side (API routes)**: `VAPI_API_KEY` - Used by `/api/vapi/call` and `/api/vapi/control` for phone calls

### ElevenLabs
- **Client-side (React SDK)**: `NEXT_PUBLIC_ELEVENLABS_API_KEY` - Required by the `useConversation` hook
- **Server-side (API routes)**: `ELEVENLABS_API_KEY` - Used by `/api/elevenlabs/token` if implementing custom WebRTC flow

### Perplexity
- **Server-side (API routes)**: `PERPLEXITY_API_KEY` - Used by `/api/perplexity/search` and `/api/vapi/perplexity-webhook` for search functionality

## Getting Your API Keys

### Vapi
1. Go to [Vapi Dashboard](https://dashboard.vapi.ai)
2. Navigate to Settings → API Keys
3. Copy your Public Key for client-side usage
4. Copy your API Key for server-side usage (if implementing phone calls)

### ElevenLabs
1. Go to [ElevenLabs Dashboard](https://elevenlabs.io/app)
2. Navigate to Settings → API Keys
3. Copy your API key

### Perplexity
1. Go to [Perplexity API Platform](https://www.perplexity.ai/api-platform)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy your API key


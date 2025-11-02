# Vapi Next.js Integration

A modern Next.js application integrated with **Vapi** and **ElevenLabs** for voice AI capabilities. This app provides a web-based voice assistant interface that allows users to interact with AI through real-time voice conversations using either platform.

## Features

- 🎙️ **Real-time Voice Conversations** - Interact with AI assistants using voice (Vapi & ElevenLabs)
- 🎤 **STT (Speech-to-Text) Visualization** - Visual indicators for user and AI speech activity
- 📊 **Audio Level Monitoring** - Real-time volume visualization with waveform display
- ⚡ **Next.js 15** - Built with the latest Next.js with App Router
- 🎨 **Modern UI** - Beautiful, responsive interface with TailwindCSS
- 📱 **Mobile Friendly** - Works seamlessly on all devices
- 🔒 **Type Safe** - Full TypeScript support
- 🛡️ **Secure API Key Handling** - Phone calls proxied through secure API routes
- 🌙 **Dark Mode** - Automatic dark mode support
- 🔀 **Multi-Platform Support** - Toggle between Vapi and ElevenLabs integrations

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- **For Vapi**: Vapi API key ([Get one here](https://dashboard.vapi.ai)) and Vapi Assistant ID
- **For ElevenLabs**: ElevenLabs API key ([Get one here](https://elevenlabs.io)) and Agent ID

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory. See `ENV_TEMPLATE.md` for a detailed template.

Add your API keys to `.env.local`:

```env
# Vapi Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
VAPI_API_KEY=your_vapi_api_key_here  # For phone calls (stays on server)
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# ElevenLabs Configuration
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here  # For server-side token generation
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
```

**Important Security Notes:**
- `NEXT_PUBLIC_*` keys are exposed to browsers - use public keys with limited permissions
- Server-side keys (without `NEXT_PUBLIC_`) are secure and only used in API routes
- Phone call requests now go through secure Next.js API routes (`/api/vapi/*`)

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 4. Start a Voice Call

**Using Vapi:**
1. Click the "Vapi" button at the top
2. Enter your Vapi Assistant ID in the input field
3. Click "Start Call" to begin a voice conversation

**Using ElevenLabs:**
1. Click the "ElevenLabs" button at the top
2. Enter your ElevenLabs Agent ID in the input field
3. Click "Start Call" to begin a voice conversation

**For both platforms:**
- Speak naturally - the assistant will respond in real-time
- Click "End Call" when you're done
- Toggle between platforms using the top buttons

## Project Structure

```
├── app/
│   ├── api/                # Next.js API routes (secure server-side)
│   │   ├── vapi/
│   │   │   ├── call/       # Vapi phone call proxy
│   │   │   └── control/    # Vapi call control proxy
│   │   └── elevenlabs/
│   │       └── token/      # ElevenLabs token generation proxy
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page with platform toggle
│   └── globals.css         # Global styles
├── components/
│   ├── VapiWidget.tsx      # Main Vapi integration component
│   ├── ElevenLabsWidget.tsx # Main ElevenLabs integration component
│   ├── VapiVisualization.tsx # STT audio visualization with speech indicators
│   └── VapiSphereVisualization.tsx # 3D sphere visualization
├── hooks/
│   ├── useVapi.ts          # Custom hook for Vapi functionality
│   └── useElevenLabs.ts    # Custom hook for ElevenLabs functionality
├── ENV_TEMPLATE.md         # Environment variables template
├── INTEGRATION_NOTES.md    # Detailed ElevenLabs integration notes
└── package.json            # Dependencies and scripts
```

## Usage

### Using the VapiWidget Component

The `VapiWidget` component provides a complete voice interface:

```tsx
import { VapiWidget } from "@/components/VapiWidget";

export default function Page() {
  return <VapiWidget />;
}
```

### Using the useVapi Hook

For custom implementations, use the `useVapi` hook:

```tsx
import { useVapi } from "@/hooks/useVapi";

const MyComponent = () => {
  const { 
    call, 
    endCall, 
    isCallActive, 
    messages,
    isUserSpeaking,
    isSpeaking,
    volumeLevel
  } = useVapi();

  return (
    <div>
      <button onClick={() => call("assistant-id")}>Start Call</button>
      {isCallActive && <button onClick={endCall}>End Call</button>}
      <div>
        User Speaking: {isUserSpeaking ? "🗣️" : "🔇"}
        AI Speaking: {isSpeaking ? "🗣️" : "🔇"}
        Volume: {volumeLevel}%
      </div>
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
    </div>
  );
};
```

## Environment Variables

### Vapi Configuration
| Variable | Description | Required | Security |
|----------|-------------|----------|----------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Your Vapi public key for web calls | Yes* | Exposed to browser |
| `VAPI_API_KEY` | Your Vapi API key for phone calls | Yes* | Server-only |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Your Vapi Assistant ID | Recommended | Exposed to browser |
| `NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID` | Your Vapi Phone Number ID | Optional | Exposed to browser |

*You need at least the public key for web calls. API key needed for phone calls.

### ElevenLabs Configuration
| Variable | Description | Required | Security |
|----------|-------------|----------|----------|
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | Your ElevenLabs API key | Yes | Exposed to browser |
| `ELEVENLABS_API_KEY` | Server-side API key for token generation | Optional | Server-only |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Your ElevenLabs Agent ID | Recommended | Exposed to browser |

## Security

This project implements security best practices to protect API keys:

### ✅ Implemented Security Features

1. **API Route Proxying**: Vapi phone calls now go through Next.js API routes (`/api/vapi/call`, `/api/vapi/control`)
   - Server-side API keys never exposed to the browser
   - Direct API calls from client removed

2. **Environment Variable Separation**:
   - `NEXT_PUBLIC_*` variables: Exposed to browser (use public keys only)
   - Server-only variables: Never leave the server (API routes only)

3. **HTTPS Enforcement**: All API communications encrypted in transit

### ⚠️ Security Considerations

**Client-Side Limitations**:
- Vapi Web SDK and ElevenLabs React SDK require client-side public keys
- These are embedded in the browser bundle
- Use public keys with minimal permissions

**Best Practices**:
- Never commit `.env.local` to version control
- Use public keys with limited scopes/permissions
- Rotate keys periodically
- Monitor API usage for unauthorized access
- Use HTTPS in production

See `ENV_TEMPLATE.md` for detailed security notes.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

### Vapi
- [Vapi Documentation](https://docs.vapi.ai)
- [Vapi Dashboard](https://dashboard.vapi.ai)
- [API Reference](https://docs.vapi.ai/api-reference)

### ElevenLabs
- [ElevenLabs Documentation](https://elevenlabs.io/docs)
- [ElevenLabs Dashboard](https://elevenlabs.io/app)
- [Conversational AI Guide](https://elevenlabs.io/docs/conversational-ai)
- **Note**: See [INTEGRATION_NOTES.md](INTEGRATION_NOTES.md) for current integration status

## Troubleshooting

### "Vapi API key is not set" Error

Make sure you have created a `.env.local` file with your API key or public key:

```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_key_here
# OR
NEXT_PUBLIC_VAPI_API_KEY=your_key_here
```

### "ElevenLabs API key is not set" Error

Make sure you have added your ElevenLabs API key to `.env.local`:

```env
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_key_here
```

### Call Not Starting

**For Vapi:**
- Verify your Assistant ID is correct
- Check that your API key is valid
- Ensure you have sufficient credits in your Vapi account

**For ElevenLabs:**
- Verify your Agent ID is correct
- Check that your API key is valid
- Ensure you have sufficient credits in your ElevenLabs account
- Note: WebRTC signaling is currently incomplete (see [INTEGRATION_NOTES.md](INTEGRATION_NOTES.md))

### No Audio

- Check browser permissions for microphone access
- Ensure you're using HTTPS or localhost (required for microphone access)
- Try refreshing the page and allowing microphone permissions again

## License

MIT

## Support

For issues related to:
- **This integration**: Open an issue in this repository
- **Vapi API**: Contact [Vapi Support](https://docs.vapi.ai) or join their [Discord](https://discord.gg/vapi)
- **ElevenLabs API**: Contact [ElevenLabs Support](https://elevenlabs.io/docs/support)

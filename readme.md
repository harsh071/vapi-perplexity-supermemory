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

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Vapi Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
# OR
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id_here

# ElevenLabs Configuration
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_elevenlabs_agent_id_here
```

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
├── .env.example            # Environment variables template
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
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Your Vapi public key (recommended for client-side) | Yes* |
| `NEXT_PUBLIC_VAPI_API_KEY` | Your Vapi API key (alternative) | Yes* |
| `NEXT_PUBLIC_VAPI_ASSISTANT_ID` | Your Vapi Assistant ID | Recommended |
| `NEXT_PUBLIC_VAPI_PHONE_NUMBER_ID` | Your Vapi Phone Number ID (for phone calls) | Optional |

*You need at least one of these keys. Public key is recommended for client-side usage.

### ElevenLabs Configuration
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | Your ElevenLabs API key | Yes |
| `NEXT_PUBLIC_ELEVENLABS_AGENT_ID` | Your ElevenLabs Agent ID | Recommended |

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

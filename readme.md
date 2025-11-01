# Vapi Next.js Integration

A modern Next.js application integrated with Vapi for voice AI capabilities. This app provides a web-based voice assistant interface that allows users to interact with AI through real-time voice conversations.

## Features

- 🎙️ **Real-time Voice Conversations** - Interact with AI assistants using voice
- ⚡ **Next.js 15** - Built with the latest Next.js with App Router
- 🎨 **Modern UI** - Beautiful, responsive interface with TailwindCSS
- 📱 **Mobile Friendly** - Works seamlessly on all devices
- 🔒 **Type Safe** - Full TypeScript support
- 🌙 **Dark Mode** - Automatic dark mode support

## Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Vapi API key ([Get one here](https://dashboard.vapi.ai))
- Vapi Assistant ID (create one in the Vapi dashboard)

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

Edit `.env.local` and add your Vapi API key or public key:

```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
# OR
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here
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

1. Enter your Vapi Assistant ID in the input field
2. Click "Start Call" to begin a voice conversation
3. Speak naturally - the assistant will respond in real-time
4. Click "End Call" when you're done

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
├── components/
│   └── VapiWidget.tsx      # Main Vapi integration component
├── hooks/
│   └── useVapi.ts          # Custom hook for Vapi functionality
├── .env.example            # Environment variables template
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
  const { call, endCall, isCallActive, messages } = useVapi();

  return (
    <div>
      <button onClick={() => call("assistant-id")}>Start Call</button>
      {isCallActive && <button onClick={endCall}>End Call</button>}
      {messages.map((msg, i) => (
        <div key={i}>{msg.content}</div>
      ))}
    </div>
  );
};
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_VAPI_PUBLIC_KEY` | Your Vapi public key (recommended for client-side) | Yes* |
| `NEXT_PUBLIC_VAPI_API_KEY` | Your Vapi API key (alternative) | Yes* |

*You need at least one of these keys. Public key is recommended for client-side usage.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Vapi Documentation

- [Vapi Documentation](https://docs.vapi.ai)
- [Vapi Dashboard](https://dashboard.vapi.ai)
- [API Reference](https://docs.vapi.ai/api-reference)

## Troubleshooting

### "Vapi API key is not set" Error

Make sure you have created a `.env.local` file with your API key or public key:

```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_key_here
# OR
NEXT_PUBLIC_VAPI_API_KEY=your_key_here
```

### Call Not Starting

- Verify your Assistant ID is correct
- Check that your API key is valid
- Ensure you have sufficient credits in your Vapi account

### No Audio

- Check browser permissions for microphone access
- Ensure you're using HTTPS or localhost (required for microphone access)

## License

MIT

## Support

For issues related to:
- **This integration**: Open an issue in this repository
- **Vapi API**: Contact [Vapi Support](https://docs.vapi.ai) or join their [Discord](https://discord.gg/vapi)

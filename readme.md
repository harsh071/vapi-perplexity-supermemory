<div align="center">

# 🎙️ Voice AI Studio

<div align="center">

**A beautiful, production-ready voice AI platform integrating Vapi, ElevenLabs, and Perplexity**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/VAPI_MEM)

</div>

</div>

---

## ✨ Features

### 🎤 Voice Platforms
- **Vapi Integration** - Full-featured voice assistant with WebRTC support
- **ElevenLabs** - Alternative voice platform with conversational AI
- **Easy Toggle** - Switch between platforms with a single click

### 🔍 Real-time Search
- **Perplexity Integration** - Web search powered by advanced AI
- **Voice-Optimized Responses** - Natural language answers perfect for audio
- **Source Attribution** - Transparent citations for every response

### 🎨 Beautiful UI/UX
- **3D Visualizations** - Interactive sphere visualization using Three.js
- **Real-time Audio Monitoring** - Waveforms and volume meters
- **Speech Indicators** - Visual feedback for user and AI speech
- **Glassmorphic Design** - Modern, glass-like aesthetic
- **Responsive** - Works beautifully on desktop and mobile

### 🛡️ Security & Performance
- **Secure API Key Management** - Server-side proxying prevents key exposure
- **Type-Safe** - Full TypeScript support throughout
- **Production Ready** - Optimized for deployment
- **Mobile Friendly** - PWA-ready with offline capabilities

### 🚀 Developer Experience
- **Modern Stack** - Next.js 15, React 19, TailwindCSS
- **Custom Hooks** - Reusable `useVapi` and `useElevenLabs` hooks
- **Clean Architecture** - Well-organized, maintainable codebase
- **Comprehensive Docs** - Detailed integration guides

---

## 🎯 Demo

![Voice AI Studio Demo](https://via.placeholder.com/800x400?text=Voice+AI+Studio+Demo)

**Features Shown:**
- 3D sphere visualization responding to audio
- Real-time speech-to-text indicators
- Beautiful glassmorphic interface
- Multi-platform voice integration

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** 
- **npm** | **yarn** | **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/VAPI_MEM.git
cd VAPI_MEM

# Install dependencies
npm install

# Set up environment variables
cp ENV_TEMPLATE.md .env.local
# Edit .env.local with your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Environment Setup

Create a `.env.local` file in the root directory:

```env
# Required: Vapi Configuration
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_API_KEY=your_vapi_api_key
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_assistant_id

# Required: ElevenLabs Configuration
NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=your_agent_id

# Optional: Perplexity (for web search)
PERPLEXITY_API_KEY=your_perplexity_key
```

**Get Your API Keys:**
- [Vapi Dashboard](https://dashboard.vapi.ai)
- [ElevenLabs Dashboard](https://elevenlabs.io/app)
- [Perplexity API Platform](https://www.perplexity.ai/api-platform)

---

## 📖 Usage

### Basic Voice Call

```tsx
import { VapiWidget } from "@/components/VapiWidget";

export default function VoicePage() {
  return <VapiWidget />;
}
```

### Custom Integration

```tsx
import { useVapi } from "@/hooks/useVapi";

const VoiceAssistant = () => {
  const { call, endCall, isCallActive, volumeLevel } = useVapi();

  return (
    <div>
      <button onClick={() => call("assistant-id")}>
        Start Conversation
      </button>
      {isCallActive && (
        <>
          <div>Volume: {volumeLevel}%</div>
          <button onClick={endCall}>End Call</button>
        </>
      )}
    </div>
  );
};
```

### Web Search Integration

See [PERPLEXITY_INTEGRATION.md](PERPLEXITY_INTEGRATION.md) for detailed setup instructions.

---

## 🏗️ Project Structure

```
VAPI_MEM/
├── app/
│   ├── api/                    # Server-side API routes
│   │   ├── vapi/               # Vapi integration endpoints
│   │   │   ├── call/           # Phone call proxy
│   │   │   ├── control/        # Call control
│   │   │   └── perplexity-webhook/  # Search webhook
│   │   ├── elevenlabs/         # ElevenLabs endpoints
│   │   │   └── token/          # Token generation
│   │   └── perplexity/         # Perplexity endpoints
│   │       └── search/         # Search proxy
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   └── globals.css             # Global styles
├── components/
│   ├── VapiWidget.tsx          # Main Vapi UI
│   ├── ElevenLabsWidget.tsx    # ElevenLabs UI
│   ├── VapiVisualization.tsx   # 2D audio visualization
│   └── VapiSphereVisualization.tsx  # 3D sphere
├── hooks/
│   ├── useVapi.ts              # Vapi React hook
│   └── useElevenLabs.ts        # ElevenLabs hook
├── ENV_TEMPLATE.md             # Environment variables
├── INTEGRATION_NOTES.md        # ElevenLabs guide
├── PERPLEXITY_INTEGRATION.md   # Perplexity setup
└── package.json                # Dependencies
```

---

## 🔧 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 📚 Documentation

### Platform Guides
- 📖 [Environment Setup](ENV_TEMPLATE.md) - API key configuration
- 🎤 [ElevenLabs Integration](INTEGRATION_NOTES.md) - Platform-specific guide
- 🔍 [Perplexity Setup](PERPLEXITY_INTEGRATION.md) - Web search integration

### API References
- [Vapi Documentation](https://docs.vapi.ai)
- [ElevenLabs Docs](https://elevenlabs.io/docs)
- [Perplexity API](https://docs.perplexity.ai)

---

## 🛡️ Security

### Best Practices

✅ **Implemented:**
- Server-side API key proxying
- Environment variable separation
- HTTPS enforcement
- Secure WebSocket connections

⚠️ **Important:**
- Never commit `.env.local`
- Use public keys for client-side
- Rotate keys regularly
- Monitor API usage

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Write clean, maintainable code
- Add TypeScript types everywhere
- Follow existing code style
- Add tests for new features
- Update documentation

---

## 🐛 Troubleshooting

### Common Issues

**"Vapi API key is not set"**
```bash
# Ensure .env.local exists with correct keys
cat .env.local | grep VAPI
```

**No audio/voice output**
- Check browser permissions
- Verify microphone access
- Ensure HTTPS or localhost
- Test with another browser

**Webhook not working**
- Verify public URL (use ngrok for local)
- Check Vapi dashboard configuration
- Review server logs
- Test endpoint manually

**Need more help?**
- Check [Issues](https://github.com/yourusername/VAPI_MEM/issues)
- Read platform docs
- Join [Discussions](https://github.com/yourusername/VAPI_MEM/discussions)

---

## 🌟 Showcase

Built with:

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)

</div>

Powered by:

<div align="center">

[![Vapi](https://img.shields.io/badge/Vapi-6366F1?logo=vapi&logoColor=white)](https://vapi.ai)
[![ElevenLabs](https://img.shields.io/badge/ElevenLabs-000000?logo=elevenlabs&logoColor=white)](https://elevenlabs.io)
[![Perplexity](https://img.shields.io/badge/Perplexity-AI-007FFF?logo=perplexity&logoColor=white)](https://perplexity.ai)

</div>

---

## 📊 Roadmap

- [ ] Multi-language support
- [ ] Voice cloning integration
- [ ] Custom AI models
- [ ] Analytics dashboard
- [ ] Recording playback
- [ ] Team collaboration
- [ ] Voice commands

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Vapi](https://vapi.ai) for amazing voice infrastructure
- [ElevenLabs](https://elevenlabs.io) for realistic voice synthesis
- [Perplexity](https://perplexity.ai) for powerful search capabilities
- [Next.js](https://nextjs.org) team for the incredible framework

---

## 📞 Support

<div align="center">

**Need help or have questions?**

[![GitHub Discussions](https://img.shields.io/badge/GitHub_Discussions-181717?logo=github&logoColor=white)](https://github.com/yourusername/VAPI_MEM/discussions)
[![Discord](https://img.shields.io/badge/Discord-5865F2?logo=discord&logoColor=white)](https://discord.gg/vapi)
[![Email](https://img.shields.io/badge/Email-D14836?logo=gmail&logoColor=white)](mailto:support@example.com)

Made with ❤️ by the open source community

</div>

---

<div align="center">

**[⬆ Back to Top](#-voice-ai-studio)**

⭐ Star this repo if you found it helpful!

</div>

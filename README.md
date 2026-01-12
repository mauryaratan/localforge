# LocalForge

Privacy-first developer utilities that run entirely in your browser. Your data never leaves your device.

## Features

- **100% Private** — No server uploads, no tracking. Everything runs locally in your browser
- **Works Offline** — Install as a PWA and use anywhere, even without internet
- **Lightning Fast** — No network latency, instant results with WebAssembly-powered processing
- **20+ Tools** — All the utilities developers need, in one place

## Available Tools

| Category | Tools |
|----------|-------|
| **Encoding** | Base64, URL Encoder, HTML Entities |
| **Data Formats** | JSON Formatter, JSON/YAML, JSON/CSV |
| **Text** | String Case Converter, Word Counter, Markdown Preview |
| **Web** | URL Parser, HTML Preview, HTML Symbols |
| **Generators** | UUID/ULID, QR Code, Favicon Maker, Logo Maker |
| **Images** | Image Compressor, SVG to CSS, SVG to JSX |
| **Dev Tools** | Regex Tester, Cron Parser, Unix Time, Keycode, Color Converter |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/localforge.git
cd localforge

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
pnpm build
pnpm start
```

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix primitives
- **Icons**: [Hugeicons](https://hugeicons.com/)
- **Linting**: [Biome](https://biomejs.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run Biome linter |
| `pnpm format` | Format code with Biome |
| `pnpm test` | Run tests with Vitest |

## Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional: Your production URL (defaults to localhost in development)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional: Enable Vercel Analytics (only works on Vercel)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

See `.env.example` for all available options.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

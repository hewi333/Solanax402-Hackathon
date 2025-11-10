import { Badge } from './ui/badge'

/**
 * TechBanner Component
 * Displays a floating technology showcase with ASCII art logos
 * Shows all the technologies used to build this project
 */
export default function TechBanner() {
  const technologies = [
    {
      name: 'Solana x402',
      subtitle: 'Payment Protocol',
      ascii: `
  ╔═══════╗
  ║  402  ║
  ╚═══════╝
      `
    },
    {
      name: 'Solana',
      subtitle: 'Blockchain',
      ascii: `
    ◢◤
  ◢████◤
  ████
      `
    },
    {
      name: 'Gradient Parallax',
      subtitle: 'AI Agent Platform',
      ascii: `
  ▲ ▲ ▲
  ▼ ▼ ▼
  AI
      `
    },
    {
      name: 'gpt-oss-120b',
      subtitle: 'Open Source Model',
      ascii: `
  [GPT]
  120B
      `
    },
    {
      name: 'Coinbase CDP',
      subtitle: 'Embedded Wallets',
      ascii: `
  ┌───┐
  │ C │
  └───┘
      `
    },
    {
      name: 'Phantom',
      subtitle: 'Browser Wallet',
      ascii: `
  👻
  PWA
      `
    },
    {
      name: 'Vercel',
      subtitle: 'Frontend Hosting',
      ascii: `
  ▲
  Deploy
      `
    },
    {
      name: 'Railway',
      subtitle: 'Backend API',
      ascii: `
  ━━━━
  API
      `
    }
  ]

  return (
    <div className="relative overflow-hidden py-12 border-t border-white/5 bg-black/20">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Title */}
      <div className="text-center mb-8">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">
          <span className="text-solana-purple">[</span> Built with <span className="text-solana-green">]</span>
        </p>
      </div>

      {/* Scrolling tech stack */}
      <div className="relative">
        <div className="flex animate-scroll gap-12">
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <div
              key={i}
              className="flex-shrink-0 group"
            >
              <div className="flex flex-col items-center gap-3">
                {/* ASCII Art Logo */}
                <div className="relative">
                  <div className="p-4 border border-white/10 rounded-lg bg-black/40 group-hover:border-solana-purple/50 transition-colors min-w-[120px] min-h-[100px] flex items-center justify-center">
                    <pre className="text-[10px] leading-tight text-gray-400 group-hover:text-white transition-colors font-mono text-center">
                      {tech.ascii}
                    </pre>
                  </div>
                </div>

                {/* Name and subtitle */}
                <div className="text-center max-w-[140px]">
                  <p className="text-xs font-mono font-semibold text-gray-300 group-hover:text-white transition-colors truncate">
                    {tech.name}
                  </p>
                  <p className="text-[10px] text-gray-600 font-mono mt-0.5">
                    {tech.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile note */}
      <div className="text-center mt-6">
        <p className="text-[10px] text-gray-600 font-mono">
          Scroll to explore all technologies →
        </p>
      </div>
    </div>
  )
}

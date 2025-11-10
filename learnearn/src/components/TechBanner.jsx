import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, FreeMode } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/free-mode'

/**
 * TechBanner Component
 * Displays a scrolling technology showcase with monochromatic SVG logos
 * Mobile: Swipeable with touch gestures
 * Desktop: Auto-scrolling with pause-on-hover
 */
export default function TechBanner() {
  const technologies = [
    {
      name: 'x402',
      subtitle: 'Payment Protocol',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="10" width="80" height="80" rx="8" stroke="currentColor" strokeWidth="2"/>
          <text x="50" y="45" fontSize="24" fontWeight="bold" fill="currentColor" textAnchor="middle" fontFamily="monospace">402</text>
          <text x="50" y="70" fontSize="12" fill="currentColor" textAnchor="middle" fontFamily="monospace">PAYMENT</text>
        </svg>
      )
    },
    {
      name: 'Solana',
      subtitle: 'Blockchain',
      logo: (
        <svg width="80" height="80" viewBox="0 0 397.7 311.7" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="currentColor"/>
          <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="currentColor"/>
          <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Gradient',
      subtitle: 'Distributed AI Inference',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="30" r="8" fill="currentColor"/>
          <circle cx="30" cy="50" r="8" fill="currentColor"/>
          <circle cx="70" cy="50" r="8" fill="currentColor"/>
          <circle cx="50" cy="70" r="8" fill="currentColor"/>
          <line x1="50" y1="30" x2="30" y2="50" stroke="currentColor" strokeWidth="2"/>
          <line x1="50" y1="30" x2="70" y2="50" stroke="currentColor" strokeWidth="2"/>
          <line x1="30" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="2"/>
          <line x1="70" y1="50" x2="50" y2="70" stroke="currentColor" strokeWidth="2"/>
          <text x="50" y="92" fontSize="10" fill="currentColor" textAnchor="middle" fontFamily="monospace">AI</text>
        </svg>
      )
    },
    {
      name: 'Coinbase CDP',
      subtitle: 'Embedded Wallets',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="3"/>
          <rect x="35" y="35" width="30" height="30" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Phantom',
      subtitle: 'Browser Wallet',
      logo: (
        <svg width="80" height="80" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M85.5 45.5C85.5 38.5964 79.9036 33 72.9999 33H47.5001C42.5295 33 38.5 37.0294 38.5 42.0001V86C38.5 90.9706 42.5295 95 47.5001 95H80.4999C85.4705 95 89.5 90.9706 89.5 86V59C89.5 51.5442 83.4558 45.5 76 45.5H85.5Z" fill="currentColor"/>
          <circle cx="76" cy="54" r="4" fill="#000"/>
          <circle cx="64" cy="54" r="4" fill="#000"/>
        </svg>
      )
    },
    {
      name: 'Vercel',
      subtitle: 'Frontend Hosting',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 20L80 75H20L50 20Z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Railway',
      subtitle: 'Backend Server & APIs',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="20" y="35" width="60" height="8" fill="currentColor"/>
          <rect x="20" y="57" width="60" height="8" fill="currentColor"/>
          <rect x="30" y="25" width="4" height="50" fill="currentColor"/>
          <rect x="50" y="25" width="4" height="50" fill="currentColor"/>
          <rect x="66" y="25" width="4" height="50" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Claude Code',
      subtitle: 'AI Coding Assistant',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="3"/>
          <path d="M40 40L35 50L40 60M60 40L65 50L60 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="38" x2="48" y2="62" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      )
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
          BUILT_WITH
        </p>
      </div>

      {/* Swiper Carousel */}
      <div className="relative">
        <Swiper
          modules={[Autoplay, FreeMode]}
          spaceBetween={48}
          slidesPerView="auto"
          loop={true}
          speed={2000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.5,
            momentumVelocityRatio: 0.5,
          }}
          breakpoints={{
            320: {
              spaceBetween: 32,
            },
            768: {
              spaceBetween: 48,
            },
          }}
          className="tech-carousel"
        >
          {/* Render technologies multiple times for seamless loop */}
          {[...technologies, ...technologies, ...technologies].map((tech, i) => (
            <SwiperSlide key={i} style={{ width: 'auto' }}>
              <div className="flex-shrink-0 group">
                <div className="flex flex-col items-center gap-3">
                  {/* SVG Logo */}
                  <div className="relative">
                    <div className="p-4 border border-white/10 rounded-lg bg-black/40 group-hover:border-solana-purple/50 transition-all duration-300 min-w-[120px] min-h-[100px] flex items-center justify-center">
                      <div className="text-gray-400 group-hover:text-white transition-colors duration-300 w-20 h-20 flex items-center justify-center">
                        {tech.logo}
                      </div>
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Mobile/Desktop instruction */}
      <div className="text-center mt-6">
        <p className="text-[10px] text-gray-600 font-mono">
          <span className="hidden md:inline">Hover to pause</span>
          <span className="md:hidden">Swipe to explore all technologies</span>
        </p>
      </div>
    </div>
  )
}

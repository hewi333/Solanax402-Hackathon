import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'

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
          {/* Gradient Network logo - simplified version */}
          <path d="M30 35L50 20L70 35L70 65L50 80L30 65Z" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <circle cx="50" cy="35" r="4" fill="currentColor"/>
          <circle cx="50" cy="50" r="4" fill="currentColor"/>
          <circle cx="50" cy="65" r="4" fill="currentColor"/>
          <line x1="35" y1="42" x2="65" y2="42" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="35" y1="58" x2="65" y2="58" stroke="currentColor" strokeWidth="1.5"/>
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
          {/* Phantom wallet logo - ghost shape */}
          <path d="M64 25C45 25 30 40 30 59V85C30 92 35 98 42 98C49 98 54 92 54 85V75C54 75 54 70 60 70C66 70 66 75 66 75V85C66 92 71 98 78 98C85 98 90 92 90 85V59C90 40 75 25 64 25Z" fill="currentColor"/>
          <ellipse cx="52" cy="58" rx="4" ry="6" fill="#000"/>
          <ellipse cx="76" cy="58" rx="4" ry="6" fill="#000"/>
          <path d="M56 68C56 68 60 72 64 72C68 72 72 68 72 68" stroke="#000" strokeWidth="2" strokeLinecap="round"/>
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
          {/* Train locomotive */}
          {/* Train body */}
          <rect x="25" y="40" width="50" height="25" rx="3" fill="currentColor"/>
          {/* Cabin */}
          <rect x="55" y="30" width="15" height="10" fill="currentColor"/>
          {/* Smokestack */}
          <rect x="32" y="32" width="6" height="8" fill="currentColor"/>
          {/* Smoke */}
          <circle cx="35" cy="28" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="37" cy="24" r="1.5" fill="currentColor" opacity="0.4"/>
          {/* Wheels */}
          <circle cx="35" cy="68" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="35" cy="68" r="2" fill="currentColor"/>
          <circle cx="55" cy="68" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="55" cy="68" r="2" fill="currentColor"/>
          {/* Rails */}
          <line x1="15" y1="75" x2="85" y2="75" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="15" y1="78" x2="85" y2="78" stroke="currentColor" strokeWidth="1.5"/>
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
          modules={[Autoplay]}
          spaceBetween={48}
          slidesPerView="auto"
          loop={true}
          speed={5000}
          autoplay={{
            delay: 0,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
            reverseDirection: false,
          }}
          loopAdditionalSlides={3}
          allowTouchMove={true}
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
          <span className="md:hidden">Swipe to explore all technologies</span>
        </p>
      </div>
    </div>
  )
}

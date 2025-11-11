import { useRef, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination } from 'swiper/modules'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/pagination'

/**
 * TechBanner Component
 * Displays a static technology showcase with monochromatic SVG logos
 * Mobile: Swipeable with touch gestures and pagination dots
 * Desktop: Static display of all technologies
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
        <svg width="80" height="80" viewBox="0 0 26 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 19H4V22H7V19Z" fill="currentColor"/>
          <path d="M22 6V8.85011L12.9475 22H10V19.1499L19.0521 6H22Z" fill="currentColor"/>
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
      name: 'Solana Wallet Adapter',
      subtitle: 'Multi-Wallet Support',
      logo: (
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Multiple wallet icons connected - representing adapter */}
          <rect x="15" y="20" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
          <rect x="55" y="20" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
          <rect x="15" y="58" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
          <rect x="55" y="58" width="30" height="22" rx="3" stroke="currentColor" strokeWidth="2"/>
          {/* Connection lines from wallets to center point */}
          <circle cx="50" cy="50" r="6" fill="currentColor"/>
          <line x1="35" y1="42" x2="48" y2="48" stroke="currentColor" strokeWidth="2"/>
          <line x1="65" y1="42" x2="52" y2="48" stroke="currentColor" strokeWidth="2"/>
          <line x1="35" y1="58" x2="48" y2="52" stroke="currentColor" strokeWidth="2"/>
          <line x1="65" y1="58" x2="52" y2="52" stroke="currentColor" strokeWidth="2"/>
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
          modules={[Pagination]}
          spaceBetween={48}
          slidesPerView={5}
          loop={false}
          speed={300}
          allowTouchMove={true}
          centeredSlides={false}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          breakpoints={{
            320: {
              spaceBetween: 24,
              slidesPerView: 1.5,
              centeredSlides: true,
              allowTouchMove: true,
            },
            480: {
              spaceBetween: 32,
              slidesPerView: 2,
              centeredSlides: false,
              allowTouchMove: true,
            },
            768: {
              spaceBetween: 48,
              slidesPerView: 5,
              allowTouchMove: false,
            },
          }}
          className="tech-carousel pb-14 md:pb-12"
        >
          {technologies.map((tech, i) => (
            <SwiperSlide key={i}>
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
                  <div className="text-center max-w-[180px]">
                    <p className="text-xs font-mono font-semibold text-gray-300 group-hover:text-white transition-colors">
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

      {/* Mobile instruction */}
      <div className="text-center mt-4 md:mt-2">
        <p className="text-[10px] text-gray-600 font-mono md:hidden">
          Swipe to explore all technologies
        </p>
      </div>
    </div>
  )
}

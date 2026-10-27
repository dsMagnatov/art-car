import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export interface ServiceItem {
  id: string;
  name: string;
  category: string;
  time: string;
  price: string;
  description: string;
  bgColor: string;
  imageUrl: string;
}

export const DETAILING_SERVICES: ServiceItem[] = [
  {
    id: 'ceramic-coating',
    name: 'Ceramic Coating 9H',
    category: 'Surface Protection',
    time: '6–8 hrs',
    price: '$850',
    description: 'Multi-layer nanotech ceramic armor providing ultra-slick hydrophobic gloss and 5-year surface protection.',
    bgColor: '#7B5CFC', // Violet like Skiper24 screen 1
    imageUrl: '/services/service_ceramic_coating.jpg', // White Porsche GT3 with white roses
  },
  {
    id: 'exterior-polish',
    name: 'Full Exterior Polish',
    category: 'Paint Correction',
    time: '3–4 hrs',
    price: '$320',
    description: 'Multi-stage machine rotary polishing eliminating swirl marks and restoring deep mirror clarity.',
    bgColor: '#E62B80', // Vibrant magenta like Skiper24 screen 2
    imageUrl: '/services/service_exterior_polish.jpg', // Yellow car with yellow flowers
  },
  {
    id: 'deep-interior',
    name: 'Deep Interior Detailing',
    category: 'Cabin Sanitization',
    time: '4–5 hrs',
    price: '$280',
    description: 'Pressurized steam extraction, dry ozone odor purification, and meticulous cabin fiber revival.',
    bgColor: '#00A7CC', // Vibrant cyan like Skiper24 screen 3
    imageUrl: '/services/service_deep_interior.jpg', // Mercedes SL with pink roses
  },
  {
    id: 'paint-correction',
    name: 'Paint Correction & Restore',
    category: 'Surface Mastery',
    time: '8–12 hrs',
    price: '$620',
    description: 'Surgical clear-coat defect leveling removing deep micro-scratches and orange peel texture.',
    bgColor: '#FF5733', // Vivid coral red
    imageUrl: '/services/service_paint_correction.jpg', // Classic Porsche in forest with flowers
  },
  {
    id: 'leather-care',
    name: 'Leather Care & Restore',
    category: 'Upholstery Treatment',
    time: '2–3 hrs',
    price: '$190',
    description: 'Deep micro-pore cleansing and essential oils replenishment protecting against creases and dye transfer.',
    bgColor: '#10B981', // Vivid emerald green
    imageUrl: '/services/service_leather_care.jpg', // Grey Porsche with violet/pink tulips
  },
  {
    id: 'engine-bay',
    name: 'Engine Bay Clean & Coat',
    category: 'Powertrain Care',
    time: '1.5–2 hrs',
    price: '$140',
    description: 'Dielectric dry-steam degreasing with antistatic sealants preserving rubber hoses and engine plastics.',
    bgColor: '#2563EB', // Electric royal blue
    imageUrl: '/services/service_engine_bay.jpg', // Red car with red tulips
  },
  {
    id: 'rain-repel',
    name: 'Windshield Rain Repel',
    category: 'Glass Nano-Shield',
    time: '1–1.5 hrs',
    price: '$95',
    description: 'Fluoropolymer hydrophobic barrier for maximum wet-weather visibility and effortless bug removal.',
    bgColor: '#8B5CF6', // Vivid violet
    imageUrl: '/services/service_rain_repel.jpg', // Black muscle car with cascade of tulips
  },
  {
    id: 'showroom-package',
    name: 'Signature Showroom Package',
    category: 'Master Concierge',
    time: '1–2 days',
    price: '$1,250',
    description: 'Comprehensive 360-degree rejuvenation of every visible surface to pristine collector-grade perfection.',
    bgColor: '#D946EF', // Vivid fuchsia
    imageUrl: '/services/service_showroom_package.jpg', // Cream Mercedes 280 SL trunk with hydrangeas
  },
];

export const ServicesStackSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeService = DETAILING_SERVICES[activeIndex] || DETAILING_SERVICES[0];

  // Preload images for instant switching
  useEffect(() => {
    DETAILING_SERVICES.forEach((service) => {
      const img = new Image();
      img.src = service.imageUrl;
    });
  }, []);

  // Observe which item is in the focal center zone during smooth river-like scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const centerY = window.innerHeight * 0.46;

      let closestIndex = 0;
      let minDistance = Infinity;

      itemRefs.current.forEach((ref, index) => {
        if (!ref) return;
        const rect = ref.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(itemCenter - centerY);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== activeIndex) {
        setActiveIndex(closestIndex);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeIndex]);

  return (
    <section
      id="services-stack-section"
      ref={containerRef}
      style={{ backgroundColor: activeService.bgColor }}
      className="relative z-20 w-full min-h-screen transition-colors duration-700 ease-out rounded-t-[32px] sm:rounded-t-[48px] shadow-[0_-25px_60px_rgba(0,0,0,0.25)] select-none px-6 sm:px-10 md:px-12 lg:px-16 py-20 sm:py-24 md:py-28 lg:py-32 flex flex-col justify-center"
    >
      {/* Edge-to-edge layout: items list on left, top-right price + description + button, bottom-right white rectangle */}
      <div className="relative w-full flex flex-col lg:flex-row justify-between items-stretch gap-10 lg:gap-14 my-auto">
        {/* Full-width Left List of Services */}
        <div className="w-full lg:flex-1 flex flex-col space-y-7 sm:space-y-9 md:space-y-11">
          {DETAILING_SERVICES.map((service, idx) => {
            const isActive = idx === activeIndex;

            return (
              <div
                key={service.id}
                ref={(el) => (itemRefs.current[idx] = el)}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => setActiveIndex(idx)}
                className={`group flex items-baseline justify-start flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 cursor-pointer transition-all duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-35 hover:opacity-75'
                }`}
              >
                {/* Service Title in Instrument Serif */}
                <h2
                  className={`font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] xl:text-[4.75rem] font-normal tracking-tight transition-colors duration-300 leading-none ${
                    isActive ? 'text-black' : 'text-black/85'
                  }`}
                >
                  {service.name}
                </h2>

                {/* Category Pill */}
                <span
                  className={`inline-flex items-center text-[11px] sm:text-xs font-semibold px-3 py-0.5 sm:py-1 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-black/15 text-black'
                      : 'bg-black/10 text-black/60 group-hover:bg-black/15 group-hover:text-black/80'
                  }`}
                >
                  {service.category}
                </span>

                {/* Duration Tag */}
                <span
                  className={`font-mono text-sm sm:text-base md:text-lg font-semibold tracking-wide transition-opacity duration-300 ${
                    isActive ? 'text-black/95' : 'text-black/50'
                  }`}
                >
                  [{service.time}]
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Column: Top Right Price & Description + Button, Bottom Right White Rectangle with Image */}
        <div className="w-full lg:w-80 xl:w-[340px] flex flex-col justify-between items-start lg:items-end flex-shrink-0 self-stretch gap-8">
          {/* Top Right: Price in Instrument Serif, Short Description & Rounded White Button */}
          <div className="w-full text-left lg:text-right pt-1 sm:pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="font-instrument text-5xl sm:text-6xl lg:text-7xl text-black font-normal tracking-tight leading-none">
                  {activeService.price}
                </div>
                <p className="text-xs sm:text-sm text-black/80 font-medium leading-relaxed max-w-xs mt-2.5 sm:mt-3 lg:ml-auto">
                  {activeService.description}
                </p>
                <div className="mt-4 sm:mt-5 flex justify-start lg:justify-end">
                  <button
                    type="button"
                    id={`book-service-${activeService.id}`}
                    className="px-6 py-2.5 sm:py-3 bg-white text-black font-semibold text-xs sm:text-sm tracking-wide rounded-full shadow-none hover:bg-white/90 active:scale-95 transition-all duration-200 cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Book Service</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Right: White Rectangle Frame in 3:4 format with Category Image */}
          <div className="w-full flex justify-center lg:justify-end">
            <motion.div
              layout
              className="relative w-56 sm:w-64 md:w-72 lg:w-80 xl:w-[340px] aspect-[3/4] bg-white rounded-[24px] sm:rounded-[32px] p-2.5 sm:p-3 overflow-hidden shadow-none border-0 transition-transform duration-500 hover:scale-[1.01]"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService.id}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full h-full overflow-hidden rounded-[16px] sm:rounded-[22px] bg-neutral-100"
                >
                  <img
                    src={activeService.imageUrl}
                    alt={activeService.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                    loading="eager"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

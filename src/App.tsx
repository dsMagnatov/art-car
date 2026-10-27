/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { ServicesStackSection } from './components/ServicesStackSection';

const VIDEO_HERO_PATH = '/assets/aistudio/magnific_static-lockedoff-camera-n_aF1ZXe6fSh_d6fef2fb.mp4';
const VIDEO_FORWARD_FAST = '/car-forward-fast.mp4';
const VIDEO_REVERSE_FAST = '/car-reverse-fast.mp4';
const VIDEO_FORWARD_FALLBACK = '/car-forward.mp4';
const VIDEO_REVERSE_FALLBACK = '/car-reverse.mp4';
const REMOTE_FALLBACK_URL =
  'https://pikaso.cdnpk.net/private/production/5343350104/efbd06bc-8d8a-4115-a118-91366cfdbe9e-0.mp4?token=exp=1788739200~hmac=1ace9d92f20484ee5f7a8061c9548a02d83daf9487a5ea403afb82a4796abcf2';

interface CarBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallaxContainerRef = useRef<HTMLDivElement>(null);
  const forwardVideoRef = useRef<HTMLVideoElement>(null);
  const reverseVideoRef = useRef<HTMLVideoElement>(null);
  const rafRenderRef = useRef<number | null>(null);
  const rafParallaxRef = useRef<number | null>(null);

  const targetParallaxRef = useRef({ x: 0, y: 0 });
  const currentParallaxRef = useRef({ x: 0, y: 0 });

  const [activeTab, setActiveTab] = useState<'Home' | 'About' | 'Services' | 'Contact'>('Home');
  const [activeMode, setActiveMode] = useState<'idle' | 'forward' | 'reverse'>('idle');
  const [videoDuration, setVideoDuration] = useState(5.041667);
  const [carBox, setCarBox] = useState<CarBox>({ left: 0, top: 0, width: 0, height: 0 });

  const activeModeRef = useRef<'idle' | 'forward' | 'reverse'>('idle');
  activeModeRef.current = activeMode;
  const lenisRef = useRef<Lenis | null>(null);

  // Initialize Lenis for luxurious, silky smooth scrolling like a ship floating down a river
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    let reqId: number;
    const raf = (time: number) => {
      lenis.raf(time);
      reqId = requestAnimationFrame(raf);
    };
    reqId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Responsive calculation of the car position over the full-screen object-cover canvas
  useEffect(() => {
    const updateCarBounds = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const videoAspect = 16 / 9;
      const windowAspect = vw / vh;

      let renderedW = vw;
      let renderedH = vh;
      let offsetX = 0;
      let offsetY = 0;

      if (windowAspect > videoAspect) {
        renderedW = vw;
        renderedH = vw / videoAspect;
        offsetX = 0;
        offsetY = (vh - renderedH) / 2;
      } else {
        renderedH = vh;
        renderedW = vh * videoAspect;
        offsetX = (vw - renderedW) / 2;
        offsetY = 0;
      }

      // Precise bounding box of the car in the 1920x1080 frame
      const carRelX = 0.22;
      const carRelY = 0.52;
      const carRelW = 0.53;
      const carRelH = 0.38;

      setCarBox({
        left: offsetX + renderedW * carRelX,
        top: offsetY + renderedH * carRelY,
        width: renderedW * carRelW,
        height: renderedH * carRelH,
      });
    };

    updateCarBounds();
    window.addEventListener('resize', updateCarBounds);
    return () => window.removeEventListener('resize', updateCarBounds);
  }, []);

  // Smooth parallax effect tracking cursor movement with slight scale to prevent black borders
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const nx = (e.clientX - w / 2) / (w / 2);
      const ny = (e.clientY - h / 2) / (h / 2);
      targetParallaxRef.current = {
        x: Math.max(-1, Math.min(1, nx)),
        y: Math.max(-1, Math.min(1, ny)),
      };
    };

    const handleMouseLeave = () => {
      targetParallaxRef.current = { x: 0, y: 0 };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const { innerWidth: w, innerHeight: h } = window;
        const nx = (touch.clientX - w / 2) / (w / 2);
        const ny = (touch.clientY - h / 2) / (h / 2);
        targetParallaxRef.current = {
          x: Math.max(-1, Math.min(1, nx)),
          y: Math.max(-1, Math.min(1, ny)),
        };
      }
    };

    const handleTouchEnd = () => {
      targetParallaxRef.current = { x: 0, y: 0 };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    let isRunning = true;
    const MAX_SHIFT_X = 26; // horizontal shift in px
    const MAX_SHIFT_Y = 18; // vertical shift in px

    const parallaxLoop = () => {
      if (!isRunning) return;

      const target = targetParallaxRef.current;
      const current = currentParallaxRef.current;

      current.x += (target.x - current.x) * 0.07;
      current.y += (target.y - current.y) * 0.07;

      if (parallaxContainerRef.current) {
        const shiftX = -current.x * MAX_SHIFT_X;
        const shiftY = -current.y * MAX_SHIFT_Y;
        parallaxContainerRef.current.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0) scale(1.05)`;
      }

      rafParallaxRef.current = requestAnimationFrame(parallaxLoop);
    };

    rafParallaxRef.current = requestAnimationFrame(parallaxLoop);

    return () => {
      isRunning = false;
      if (rafParallaxRef.current !== null) {
        cancelAnimationFrame(rafParallaxRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Continuous canvas render loop: eliminates any black flash or CSS crossfade flicker
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      const fv = forwardVideoRef.current;
      const rv = reverseVideoRef.current;
      const mode = activeModeRef.current;

      const targetVideo = mode === 'reverse' ? rv : fv;

      // Only draw when target video has valid frame ready and is not mid-seek
      if (
        targetVideo &&
        targetVideo.readyState >= 2 &&
        !targetVideo.seeking
      ) {
        try {
          ctx.drawImage(targetVideo, 0, 0, 1920, 1080);
        } catch {
          // Ignore transient drawImage exceptions during rapid media transitions
        }
      } else if (fv && fv.readyState >= 2 && !fv.seeking) {
        // Fallback to forward video's current frame so canvas never goes dark
        try {
          ctx.drawImage(fv, 0, 0, 1920, 1080);
        } catch {
          // ignore
        }
      }

      rafRenderRef.current = requestAnimationFrame(renderLoop);
    };

    rafRenderRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (rafRenderRef.current !== null) {
        cancelAnimationFrame(rafRenderRef.current);
      }
    };
  }, []);

  // Render the initial frame as soon as forward video metadata or data loads
  const handleInitialFrameReady = () => {
    const canvas = canvasRef.current;
    const fv = forwardVideoRef.current;
    if (!canvas || !fv) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (ctx && fv.readyState >= 2) {
      try {
        ctx.drawImage(fv, 0, 0, 1920, 1080);
      } catch {
        // ignore
      }
    }
  };

  // Hover start: forward playback from current point
  const handleZoneEnter = () => {
    const fv = forwardVideoRef.current;
    const rv = reverseVideoRef.current;

    if (!fv) return;

    // If reverse video was playing, sync current position to forward video
    if (activeModeRef.current === 'reverse' && rv) {
      rv.pause();
      const dur = fv.duration || videoDuration;
      const currentForwardTime = Math.max(0, Math.min(dur, dur - rv.currentTime));
      fv.currentTime = currentForwardTime;
    }

    setActiveMode('forward');

    const playPromise = fv.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Safe catch for autoplay restrictions
      });
    }
  };

  // Hover end: reverse playback back to the beginning with zero flicker
  const handleZoneLeave = () => {
    const fv = forwardVideoRef.current;
    const rv = reverseVideoRef.current;

    if (!fv) return;

    const dur = fv.duration || videoDuration;
    const currentForwardPos = fv.currentTime;

    // If already at beginning, stay idle
    if (currentForwardPos <= 0.02) {
      fv.pause();
      fv.currentTime = 0;
      setActiveMode('idle');
      return;
    }

    fv.pause();

    // Check if reverse video asset is ready to play
    if (rv && !isNaN(rv.duration) && rv.readyState >= 2) {
      const targetReverseTime = Math.max(0, Math.min(dur, dur - currentForwardPos));
      rv.currentTime = targetReverseTime;
      setActiveMode('reverse');

      const playPromise = rv.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback: stay at current frame
          setActiveMode('idle');
        });
      }
    } else {
      // Fallback
      setActiveMode('idle');
    }
  };

  // When forward video reaches the end
  const handleForwardEnded = () => {
    const fv = forwardVideoRef.current;
    if (fv) {
      fv.pause();
    }
  };

  // When reverse video reaches the end (which represents start of the original video)
  const handleReverseEnded = () => {
    const fv = forwardVideoRef.current;
    const rv = reverseVideoRef.current;

    if (rv) {
      rv.pause();
    }
    if (fv) {
      fv.currentTime = 0;
      handleInitialFrameReady();
    }
    setActiveMode('idle');
  };

  // Check reverse video timeupdate to stop at start
  const handleReverseTimeUpdate = () => {
    const rv = reverseVideoRef.current;
    const fv = forwardVideoRef.current;
    const dur = (fv && fv.duration) || videoDuration;

    if (rv && rv.currentTime >= dur - 0.04) {
      rv.pause();
      if (fv) {
        fv.currentTime = 0;
        handleInitialFrameReady();
      }
      setActiveMode('idle');
    }
  };

  return (
    <div className="relative w-full bg-white">
      {/* Screen 1: Hero Scene (Sticky Card in the Stack) */}
      <section
        id="hero-video-screen"
        className="sticky top-0 w-full h-screen overflow-hidden bg-white select-none z-10"
      >
        {/* Parallax Scene: moves canvas and car hitbox synchronously */}
      <div
        ref={parallaxContainerRef}
        id="parallax-scene"
        className="absolute inset-0 w-full h-full will-change-transform pointer-events-auto"
        style={{ transform: 'translate3d(0px, 0px, 0px) scale(1.05)' }}
      >
        {/* Seamless Canvas Surface - Never flashes dark because it keeps the previous frame during transitions */}
        <canvas
          id="fullscreen-canvas-player"
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover block select-none pointer-events-none"
        />

        {/* Invisible Interactive Rectangular Zone directly over the car */}
        {carBox.width > 0 && (
          <div
            id="car-hover-zone"
            style={{
              left: `${carBox.left}px`,
              top: `${carBox.top}px`,
              width: `${carBox.width}px`,
              height: `${carBox.height}px`,
            }}
            onMouseEnter={handleZoneEnter}
            onMouseLeave={handleZoneLeave}
            onTouchStart={handleZoneEnter}
            onTouchEnd={handleZoneLeave}
            className="absolute z-20 cursor-pointer bg-transparent"
            aria-label="Зона взаємодії з автомобілем"
          />
        )}
      </div>

      {/* Foreground Content Overlay */}
      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col p-4 sm:p-6 md:p-8 lg:p-10">
        {/* Top Header: Logo + Floating Nav */}
        <header className="w-full flex items-center justify-between relative">
          <div
            id="site-logo"
            className="font-instrument text-2xl sm:text-3xl md:text-4xl text-black tracking-tight select-none pointer-events-auto"
          >
            Art.Car
          </div>

          {/* Centered Navigation Capsule */}
          <nav
            id="header-nav"
            className="absolute left-1/2 -translate-x-1/2 pointer-events-auto bg-[#141414]/95 backdrop-blur-md px-1.5 py-1.5 rounded-full border border-black/10 shadow-lg flex items-center gap-1"
          >
            {(['Home', 'About', 'Services', 'Contact'] as const).map((tab) => (
              <button
                key={tab}
                id={`nav-item-${tab.toLowerCase()}`}
                type="button"
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === 'Services') {
                    const target = document.getElementById('services-stack-section');
                    if (target) {
                      if (lenisRef.current) {
                        lenisRef.current.scrollTo(target);
                      } else {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  } else if (tab === 'Home') {
                    if (lenisRef.current) {
                      lenisRef.current.scrollTo(0);
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className={`text-xs font-semibold px-3.5 sm:px-4 py-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeTab === tab
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </header>

        {/* Hero Title & Subheading Area - Offset by 100px from menu as requested */}
        <div className="w-full flex flex-col items-center justify-start mt-[60px] sm:mt-[80px] lg:mt-[100px]">
          <h1
            id="hero-title"
            className="font-instrument uppercase text-[#C32A51] tracking-normal font-normal text-center select-none leading-none flex flex-col items-center text-[2.2rem] sm:text-[3.2rem] md:text-[4.4rem] lg:text-[5.4rem] xl:text-[6.2rem] 2xl:text-[7rem]"
          >
            <span className="block whitespace-nowrap">
              FLAWL<span className="font-kapakana font-normal text-[1.20em] inline-block leading-none relative -top-[0.07em] select-none">E</span>SS CL<span className="font-kapakana font-normal text-[1.20em] inline-block leading-none relative -top-[0.07em] select-none">E</span>AN
            </span>
            <span className="block whitespace-nowrap -mt-[0.22em] sm:-mt-[0.26em] md:-mt-[0.30em]">
              F<span className="font-kapakana font-normal text-[1.20em] inline-block leading-none relative -top-[0.07em] select-none">O</span>R Y<span className="font-kapakana font-normal text-[1.20em] inline-block leading-none relative -top-[0.07em] select-none">O</span>UR CAR
            </span>
          </h1>

          <p
            id="hero-subheading"
            className="font-manrope uppercase text-black font-semibold tracking-[0.05em] text-[8.5px] sm:text-[9.5px] md:text-[11px] lg:text-[11.5px] max-w-sm sm:max-w-md md:max-w-xl text-center leading-snug sm:leading-relaxed mt-1 sm:mt-1.5 md:mt-2 select-none px-4"
          >
            WE BRING YOUR CAR BACK TO LIFE WITH EXPERT DETAILING AND ECO-FRIENDLY PRODUCTS
            THAT PROTECT EVERY SURFACE AND RESTORE THAT BRAND-NEW FEEL.
          </p>
        </div>
      </div>

      {/* Left Column Statistics - Centered numbers & text */}
      <aside
        id="stats-column-left"
        className="absolute left-6 sm:left-10 md:left-12 lg:left-16 xl:left-20 inset-y-0 z-30 pointer-events-none flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20 space-y-12 sm:space-y-16 lg:space-y-24"
      >
        {/* Stat 1: 15K+ */}
        <div id="stat-customers" className="flex flex-col items-center text-center">
          <span className="font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-black leading-none select-none">
            15K+
          </span>
          <p className="font-manrope uppercase text-black font-semibold text-[8.5px] sm:text-[9.5px] md:text-[10.5px] lg:text-[11px] tracking-wider leading-relaxed max-w-[190px] sm:max-w-[220px] lg:max-w-[240px] mt-2 select-none text-center">
            HAPPY CUSTOMERS WHO TRUST US WITH THEIR VEHICLES AND KEEP COMING BACK FOR A FLAWLESS CLEAN
          </p>
        </div>

        {/* Stat 2: 7 */}
        <div id="stat-experience" className="flex flex-col items-center text-center">
          <span className="font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-black leading-none select-none">
            7
          </span>
          <p className="font-manrope uppercase text-black font-semibold text-[8.5px] sm:text-[9.5px] md:text-[10.5px] lg:text-[11px] tracking-wider leading-relaxed max-w-[190px] sm:max-w-[220px] lg:max-w-[240px] mt-2 select-none text-center">
            YEARS OF PROFESSIONAL EXPERIENCE DELIVERING TOP-TIER CAR CARE AND DETAILING SERVICES
          </p>
        </div>
      </aside>

      {/* Right Column Statistics - Centered numbers & text */}
      <aside
        id="stats-column-right"
        className="absolute right-6 sm:right-10 md:right-12 lg:right-16 xl:right-20 inset-y-0 z-30 pointer-events-none flex flex-col justify-end pb-12 sm:pb-16 lg:pb-20 space-y-12 sm:space-y-16 lg:space-y-24"
      >
        {/* Stat 3: 500+ */}
        <div id="stat-monthly" className="flex flex-col items-center text-center">
          <span className="font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-black leading-none select-none">
            500+
          </span>
          <p className="font-manrope uppercase text-black font-semibold text-[8.5px] sm:text-[9.5px] md:text-[10.5px] lg:text-[11px] tracking-wider leading-relaxed max-w-[190px] sm:max-w-[220px] lg:max-w-[240px] mt-2 select-none text-center">
            CARS SERVICED EVERY MONTH WITH THE HIGHEST QUALITY STANDARDS AND ATTENTION TO DETAIL
          </p>
        </div>

        {/* Stat 4: 98% */}
        <div id="stat-recommendation" className="flex flex-col items-center text-center">
          <span className="font-instrument text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal text-black leading-none select-none">
            98%
          </span>
          <p className="font-manrope uppercase text-black font-semibold text-[8.5px] sm:text-[9.5px] md:text-[10.5px] lg:text-[11px] tracking-wider leading-relaxed max-w-[190px] sm:max-w-[220px] lg:max-w-[240px] mt-2 select-none text-center">
            OF CLIENTS RECOMMEND US TO FRIENDS AND FAMILY FOR OUR SPEED AND QUALITY OF SERVICE
          </p>
        </div>
      </aside>

      {/* Hidden Forward Video (High-performance all-intra stream) */}
      <video
        id="video-forward-source"
        ref={forwardVideoRef}
        src={VIDEO_HERO_PATH}
        muted
        playsInline
        preload="auto"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (d && !isNaN(d)) setVideoDuration(d);
          handleInitialFrameReady();
        }}
        onLoadedData={handleInitialFrameReady}
        onCanPlay={handleInitialFrameReady}
        onError={(e) => {
          // Fallback chain: uploaded hero path -> fast intra -> normal -> remote
          const currentSrc = e.currentTarget.currentSrc || e.currentTarget.src;
          if (currentSrc.includes('magnific_static')) {
            e.currentTarget.src = VIDEO_FORWARD_FAST;
          } else if (currentSrc.includes('car-forward-fast.mp4')) {
            e.currentTarget.src = VIDEO_FORWARD_FALLBACK;
          } else if (currentSrc.includes('car-forward.mp4')) {
            e.currentTarget.src = REMOTE_FALLBACK_URL;
          }
        }}
        onEnded={handleForwardEnded}
        className="absolute inset-0 pointer-events-none opacity-0 -z-10"
      />

      {/* Hidden Reverse Video (High-performance all-intra stream) */}
      <video
        id="video-reverse-source"
        ref={reverseVideoRef}
        src={VIDEO_REVERSE_FAST}
        muted
        playsInline
        preload="auto"
        onError={(e) => {
          const currentSrc = e.currentTarget.currentSrc || e.currentTarget.src;
          if (currentSrc.includes('car-reverse-fast.mp4')) {
            e.currentTarget.src = VIDEO_REVERSE_FALLBACK;
          }
        }}
        onEnded={handleReverseEnded}
        onTimeUpdate={handleReverseTimeUpdate}
        className="absolute inset-0 pointer-events-none opacity-0 -z-10"
      />
    </section>

    {/* Screen 2: Interactive Detailing Services (Skiper24 style with dynamic bg & preview square) */}
    <ServicesStackSection />
  </div>
  );
}




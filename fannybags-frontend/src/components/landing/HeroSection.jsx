import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const heroRef = useRef(null);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    if (!window.VANTA || !window.VANTA.BIRDS || !vantaRef.current) {
      console.warn("⚠️ VANTA or THREE not yet loaded");
      return;
    }

    // =====================================================
    // ⭐ INITIAL BIRD SETTINGS (TUNE THESE)
    // =====================================================
    vantaEffect.current = window.VANTA.BIRDS({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.0,
      minWidth: 200.0,
      scale: 1.0,
      scaleMobile: 1.0,
      colorMode: "lerpGradient",
      backgroundAlpha: 0.0,

      // ⭐ COLORS
      color1: 0xff3cac,
      color2: 0x2b86c5,

      // ⭐ BIRD SIZE (smaller = 0.6–1.0)
      birdSize: 1.1,

      // ⭐ HOW MANY BIRDS
      quantity: 4,

      // ⭐ BASE SPEED BEFORE SCROLL
      speedLimit: 4.0,
    });

    console.log("✅ Vanta Birds initialized successfully");

    // =====================================================
    // ⭐ SCROLL-REACTIVE "FLY TOWARD YOU" EFFECT
    // =====================================================
    const ctx = gsap.context(() => {
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,

          onUpdate: (self) => {
            const p = self.progress;

            // ⭐ SCROLL TUNING VALUES
            vantaEffect.current?.setOptions({
              speedLimit: 4 + p * 40,     // ⭐ Bird forward speed (increase 40 → 60 for CRAZY)
              cohesion: 20 + p * 80,      // ⭐ Grouping strength
              alignment: 20 + p * 80,     // ⭐ Alignment (faster forward push)
              separation: 40 + p * 150,   // ⭐ Spread outward (stronger = more 3D)
              birdSize: 0.8 - p * 0.4,    // ⭐ Shrink as they fly forward
              quantity: 10 - p * 6,       // ⭐ Fade-out amount
            });

            // Fade the hero section itself
            heroRef.current.style.opacity = String(1 - p * 0.5);
          },
        },
      });
    }, heroRef);

    // Cleanup
    return () => {
      ctx.revert();
      vantaEffect.current?.destroy();
      vantaEffect.current = null;
    };
  }, []);

  return (
    <section
      ref={heroRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 🕊️ Vanta Birds Background */}
      <div
        ref={vantaRef}
        className="absolute inset-0 -z-10 pointer-events-none"
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Invest in Music.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-green-400">
            Own the Vibe.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300 mb-10">
          Back your favorite artists. Earn royalties. Be part of the music revolution.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-green-400 text-white font-semibold rounded-full hover:scale-105 transition"
          >
            Start Investing
          </a>
          <a
            href="#how-it-works"
            className="px-8 py-4 border-2 border-gray-400 text-gray-300 font-semibold rounded-full hover:bg-gray-100/10 transition"
          >
            Learn More
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-gray-400 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

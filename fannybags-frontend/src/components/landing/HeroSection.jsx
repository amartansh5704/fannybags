import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion as Motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

// Temporary placeholder background (replace later)
const heroBg =
  'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?auto=format&fit=crop&w=1920&q=80';
// You can replace with your own later:
// import heroBg from '../../assets/hero-bg.jpg';

export default function HeroSection() {
  const heroRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
        opacity: 0.3,
        scale: 1.1,
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <Motion.h1
          ref={titleRef}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Invest in Music.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-green-400">
            Own the Vibe.
          </span>
        </Motion.h1>

        <Motion.p
          ref={subtitleRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-300 mb-10"
        >
          Back your favorite artists. Earn royalties. Be part of the music revolution.
        </Motion.p>

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
      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <Motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-gray-400 rounded-full"
          />
        </div>
      </Motion.div>
    </section>
  );
}

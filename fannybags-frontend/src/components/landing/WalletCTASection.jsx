import { useEffect, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const bgImage =
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1920&q=80';

export default function WalletCTASection() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);

  // Parallax Background
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(sectionRef.current, {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        backgroundPosition: '50% 70%',
        ease: 'none',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="wallet-cta"
      className="relative overflow-hidden text-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 py-32 px-6 max-w-5xl mx-auto">
        <Motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Join the Future of{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-green-400">
              Music Investing
            </span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
            Back your favorite artists and earn royalties every time their songs
            stream or sell.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-gradient-to-r from-pink-500 to-green-400 text-white text-lg font-semibold rounded-full hover:scale-105 transition-transform shadow-xl"
            >
              Start Investing
            </button>

            <button
              onClick={() => navigate('/campaigns')}
              className="px-10 py-4 border-2 border-gray-400 text-gray-200 text-lg font-semibold rounded-full hover:bg-white/10 transition-colors"
            >
              Explore Campaigns
            </button>
          </div>
        </Motion.div>
      </div>
    </section>
  );
}

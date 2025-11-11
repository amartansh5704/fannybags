import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!footerRef.current) return;

    const footerEl = footerRef.current;

    const ctx = gsap.context(() => {
      // 🌈 Aurora parallax motion based on scroll
      gsap.to('.aurora-blob', {
        xPercent: (i) => (i % 2 === 0 ? 15 : -15),
        yPercent: (i) => (i % 2 === 0 ? -10 : 10),
        ease: 'none',
        scrollTrigger: {
          trigger: footerEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 2,
        },
      });

      // 🌈 Aurora hue shift for dynamic color movement
      const hueObj = { hue: 0 };
      gsap.to(hueObj, {
        hue: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: footerEl,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
        onUpdate: () => {
          footerEl.style.filter = `hue-rotate(${hueObj.hue}deg)`;
        },
      });

      // ✨ Footer fade-in animation
      gsap.fromTo(
        footerEl,
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footerEl,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, footerEl);

    return () => ctx.revert();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className="relative z-[2] bg-gradient-to-b from-[#050505] via-[#0a0a0a] to-[#000] text-gray-400 border-t border-white/10 overflow-hidden"
    >
      {/* 🌌 Aurora Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="aurora-blob absolute w-[40vw] h-[40vw] bg-gradient-to-r from-pink-500/30 via-purple-500/20 to-transparent rounded-full blur-[140px] top-1/3 left-[10%]" />
        <div className="aurora-blob absolute w-[35vw] h-[35vw] bg-gradient-to-r from-green-400/20 via-blue-400/30 to-transparent rounded-full blur-[140px] bottom-1/4 right-[10%]" />
        <div className="aurora-blob absolute w-[30vw] h-[30vw] bg-gradient-to-r from-yellow-400/20 via-pink-500/30 to-transparent rounded-full blur-[120px] top-2/3 left-[40%]" />
      </div>

      {/* === CTA SECTION === */}
      <div className="relative z-10 py-32 px-6 max-w-5xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Join the Future of{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-green-400">
            Music Investing
          </span>
        </h2>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
          Back your favorite artists and earn royalties every time their songs stream or sell.
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
      </div>

      {/* === MAIN FOOTER LINKS === */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-4 gap-10 text-left">
        {/* Column 1: About */}
        <div>
          <h4 className="font-semibold mb-3 text-white text-lg flex items-center gap-2">
            <span className="text-2xl">🎵</span> FannyBags
          </h4>
          <p>
            Music funding reimagined. Invest in artists and earn revenue share.
          </p>
        </div>

        {/* Column 2: Product */}
        <div>
          <h4 className="font-semibold mb-3 text-white text-lg">Product</h4>
          <ul className="space-y-2">
            <li>
              <a href="/campaigns" className="hover:text-white transition">
                Browse Campaigns
              </a>
            </li>
            <li>
              <a href="/dashboard" className="hover:text-white transition">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/register" className="hover:text-white transition">
                Create Campaign
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Company */}
        <div>
          <h4 className="font-semibold mb-3 text-white text-lg">Company</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white transition">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Blog
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Contact
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div>
          <h4 className="font-semibold mb-3 text-white text-lg">Legal</h4>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-white transition">
                Terms of Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white transition">
                Cookie Policy
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* === Bottom Bar === */}
      <div className="relative z-10 border-t border-white/10 py-8 text-center text-sm text-gray-500">
        <p>© {currentYear} FannyBags. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-white transition">
            Twitter
          </a>
          <a href="#" className="hover:text-white transition">
            Instagram
          </a>
          <a href="#" className="hover:text-white transition">
            Discord
          </a>
        </div>
      </div>
    </footer>
  );
}

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import trendingImg from '../../assets/trending-1.jpg';

gsap.registerPlugin(ScrollTrigger);

export default function TrendingWrapper() {
  const wrapperRef = useRef(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const el = wrapperRef.current;
    const scrollEl = scrollerRef.current;
    const totalWidth = scrollEl.scrollWidth - el.offsetWidth;

    gsap.to(scrollEl, {
      x: () => `-${totalWidth}px`,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: () => `+=${scrollEl.scrollWidth}`,
        scrub: true,
        pin: true,
      },
    });

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, []);

  const cards = [1, 2, 3, 4, 5];

  return (
    <section ref={wrapperRef} className="relative min-h-screen bg-gray-900 text-white">
      <div className="sticky top-0 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4">Trending Campaigns</h2>
        <p className="text-gray-400">Discover what’s hot in the world of music</p>
      </div>

      <div ref={scrollerRef} className="flex gap-8 px-10 pb-20">
        {cards.map((i) => (
          <div
            key={i}
            className="min-w-[300px] bg-white/5 border border-white/10 rounded-3xl p-6"
          >
            <img
              src={trendingImg}
              alt="Trending"
              className="rounded-2xl mb-4 h-56 w-full object-cover"
            />
            <h3 className="text-xl font-bold mb-2">Campaign {i}</h3>
            <p className="text-gray-400 text-sm">
              Placeholder description for trending campaign.
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion as Motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const bgImage =
  'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=1920&q=80';

const steps = [
  { title: 'Create', description: 'Artists launch campaigns.', icon: '🎵' },
  { title: 'Invest', description: 'Fans back songs and claim shares.', icon: '💰' },
  { title: 'Earn', description: 'Get paid when tracks stream.', icon: '📈' },
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 60%',
            scrub: 1,
          },
          opacity: 0,
          y: 80,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center text-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-black/70" /> {/* overlay */}

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How It <span className="text-pink-500">Works</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Three simple steps to revolutionize music investing.
          </p>
        </Motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="relative bg-white/10 backdrop-blur-md rounded-3xl p-10 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <div className="text-5xl mb-6">{step.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

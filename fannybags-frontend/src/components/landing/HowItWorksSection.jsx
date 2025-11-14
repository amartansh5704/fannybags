import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import GradientBlinds from "../reactbits/backgrounds/GradientBlinds";

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    title: "Create",
    description: "Artists launch campaigns for their next big hit",
    icon: "🎵",
    color: "from-accent to-pink-500",
  },
  {
    title: "Invest",
    description: "Fans back songs and claim royalty shares",
    icon: "💰",
    color: "from-success to-emerald-400",
  },
  {
    title: "Earn",
    description: "Get paid every time the track streams or sells",
    icon: "📈",
    color: "from-purple-500 to-primary",
  },
];

export default function HowItWorksSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 80,
          duration: 1.1,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          ease: "power3.out",
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-32 px-6 overflow-hidden min-h-screen"
      style={{ backgroundColor: "#0a0a0a" }}
    >
      {/* ⭐ Gradient Blinds Background */}
      <div className="absolute inset-0 pointer-events-auto">
        <GradientBlinds
          gradientColors={["#FF48B9", "#5227FF"]}
          angle={0}
          blindCount={12}
          blindMinWidth={25}
          noise={0.35}
          spotlightRadius={0.35}
          spotlightSoftness={0.6}
          spotlightOpacity={1.5}
          mouseDampening={0.25}
          distortAmount={0}
          shineDirection="center"
          mixBlendMode="screen"
          pixelRatio = {1}
        />
      </div>

      {/* A soft overlay for depth */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How It <span className="text-accent">Works</span>
          </h2>
          <p className="text-xl text-softPink/80 max-w-2xl mx-auto">
            Three simple steps to revolutionize music investing
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="group relative"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500 rounded-3xl`}
              />

              <div className="relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-accent/50 transition-all duration-300 hover:-translate-y-2">
                <div className="mb-6 flex justify-center">
                  <div
                    className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center text-5xl shadow-2xl`}
                  >
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-3xl font-bold text-white mb-4 text-center">
                  {step.title}
                </h3>
                <p className="text-softPink/70 text-center leading-relaxed">
                  {step.description}
                </p>

                <div className="absolute top-4 right-4 text-6xl font-black text-white/5">
                  {i + 1}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

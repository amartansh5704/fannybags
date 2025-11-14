import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion as Motion } from "framer-motion";
import { campaignService } from "../../services/campaignService";
import CampaignCard from "../campaigns/CampaignCard";
import LightRays from "../reactbits/backgrounds/LightRays";

gsap.registerPlugin(ScrollTrigger);

export default function TrendingCampaignsSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const raysRef = useRef(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch trending
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await campaignService.getTrendingCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // Light Rays scroll animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const section = sectionRef.current;
    const raysEl = raysRef.current;

    let tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=3000",
        scrub: true,
        pin: true,
      },
    });

    tl.to(
      raysEl,
      {
        "--rays-opacity": 1.2,
        "--rays-length": 1.6,
        "--rays-spread": 0.95,
        duration: 1,
        ease: "power2.inOut",
      },
      0
    );

    tl.to(
      raysEl,
      {
        "--rays-color": "#7b5bff",
        duration: 1.2,
        ease: "sine.inOut",
      },
      0.5
    );

    tl.to(
      raysEl,
      {
        "--rays-color": "#4beeff",
        "--rays-length": 1.2,
        duration: 1.2,
        ease: "power3.out",
      },
      2.0
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      tl.kill();
    };
  }, []);

  // Card Animations + subtle light reaction
  useEffect(() => {
    if (!sectionRef.current || campaigns.length === 0) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top top",
        end: "+=3000",
        scrub: true,
      },
    });

    // Card 1
    tl.to(cardsRef.current[0], {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
      onUpdate: () => pulseLight(raysRef.current, 0.12),
    });

    // Card 2
    if (cardsRef.current[1]) {
      tl.to(
        cardsRef.current[1],
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => pulseLight(raysRef.current, 0.18),
        },
        "+=0.4"
      );
    }

    // Card 3
    if (cardsRef.current[2]) {
      tl.to(
        cardsRef.current[2],
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          onUpdate: () => pulseLight(raysRef.current, 0.22),
        },
        "+=0.4"
      );
    }

    return () => tl.kill();
  }, [campaigns]);

  function pulseLight(el, amt = 0.15) {
    if (!el) return;
    gsap.to(el, {
      "--rays-opacity": 1 + amt,
      "--rays-length": 1.2 + amt,
      duration: 0.25,
      ease: "power1.out",
      yoyo: true,
      repeat: 1,
    });
  }

  return (
    <section
      id="trending"
      ref={sectionRef}
      className="relative h-screen overflow-hidden flex flex-col items-center justify-center"
      style={{ backgroundColor: "#000000" }} // ← PURE BLACK BACKGROUND
    >
      {/* Light Rays on Black */}
      <div
        ref={raysRef}
        className="absolute inset-0 pointer-events-none"
        style={{
          "--rays-color": "#6f5aff",
          "--rays-opacity": 1,
          "--rays-spread": 0.8,
          "--rays-length": 1.2,
        }}
      >
        <LightRays
          raysOrigin="top-center"
          raysColor="var(--rays-color)"
          raysSpeed={1.8}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.12}
          distortion={0.04}
        />
      </div>

      {/* Slight overlay for depth */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto text-center px-6">
        <Motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-white mb-10"
        >
          Trending <span className="text-purple-400">Campaigns</span>
        </Motion.h2>

        <p className="text-xl text-gray-300 mb-16">
          Scroll to explore trending projects →
        </p>

        {loading && (
          <div className="flex justify-center items-center h-64 text-gray-400">
            Loading trending campaigns...
          </div>
        )}

        {!loading && campaigns.length > 0 && (
          <div className="relative flex justify-center items-center gap-8 h-[65vh] w-full">
            {campaigns.slice(0, 3).map((campaign, i) => (
              <div
                key={campaign.id}
                ref={(el) => (cardsRef.current[i] = el)}
                className="absolute w-[70vw] md:w-[45vw] lg:w-[35vw] h-full bg-white/5 backdrop-blur-lg rounded-3xl p-4 border border-white/10 shadow-2xl overflow-hidden opacity-0 scale-0.9 translate-x-[200px] flex justify-center items-center"
                style={{ transform: `translateX(${i * 200}px)` }}
              >
                <CampaignCard campaign={campaign} isTrending={true} />
              </div>
            ))}
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="text-gray-400">No trending campaigns found.</div>
        )}
      </div>
    </section>
  );
}

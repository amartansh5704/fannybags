import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion as Motion } from "framer-motion";
import { campaignService } from "../../services/campaignService";
import CampaignCard from "../campaigns/CampaignCard";

gsap.registerPlugin(ScrollTrigger);

const bgImage =
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1920&q=80";

export default function TrendingCampaignsSection() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch trending campaigns from API
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await campaignService.getTrendingCampaigns();
        setCampaigns(data || []);
      } catch (err) {
        console.error("Failed to fetch trending campaigns:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  // ✅ Scroll-based reveal animation (1→2→3 cards)
  useEffect(() => {
    if (!sectionRef.current || campaigns.length === 0) return;

    const section = sectionRef.current;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=3000", // controls total scroll range
        scrub: true,
        pin: true,
      },
    });

    // 1️⃣ First card only visible
    tl.to(cardsRef.current[0], {
      opacity: 1,
      x: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out",
    });

    // 2️⃣ Second card slides in next
    if (cardsRef.current[1]) {
      tl.to(
        cardsRef.current[1],
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "+=0.5"
      );
    }

    // 3️⃣ Third card slides in
    if (cardsRef.current[2]) {
      tl.to(
        cardsRef.current[2],
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
        },
        "+=0.5"
      );
    }

    // Fade all together before exit
    tl.to(cardsRef.current, {
      opacity: 0.8,
      scale: 0.95,
      duration: 0.8,
      ease: "power1.inOut",
    });

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
      tl.kill();
    };
  }, [campaigns]);

  return (
    <section
      id="trending"
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-cover bg-center flex flex-col items-center justify-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      <div className="relative z-10 max-w-7xl mx-auto text-center px-6">
        <Motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-bold text-white mb-10"
        >
          Trending <span className="text-green-400">Campaigns</span>
        </Motion.h2>

        <p className="text-xl text-gray-300 mb-16">
          Scroll to explore trending projects →
        </p>

        {loading && (
          <div className="flex justify-center items-center h-64 text-gray-400">
            Loading trending campaigns...
          </div>
        )}

        {/* Cards container */}
        {!loading && campaigns.length > 0 && (
          <div className="relative flex justify-center items-center gap-8 h-[65vh] w-full">
            {campaigns.slice(0, 3).map((campaign, i) => (
              <div
                key={campaign.id}
                ref={(el) => (cardsRef.current[i] = el)}
                className="absolute w-[70vw] md:w-[45vw] lg:w-[35vw] h-full bg-white/5 backdrop-blur-lg rounded-3xl p-4 border border-white/10 shadow-2xl overflow-hidden opacity-0 scale-0.9 translate-x-[200px] flex justify-center items-center"
                style={{
                  transform: `translateX(${i * 200}px)`,
                }}
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

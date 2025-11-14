// src/pages/Landing.jsx
import SmoothScroll from "../components/landing/SmoothScroll";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import TrendingCampaignsSection from "../components/landing/TrendingCampaignsSection";
import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  useEffect(() => {
    // Refresh GSAP after DOM paint so pinned sections calculate correctly.
    // Slight delay helps when using SmoothScroll/Lenis.
    const t = setTimeout(() => {
      try {
        ScrollTrigger.refresh(true);
      } catch (e) {
        console.warn("ScrollTrigger.refresh() failed:", e);
      }
    }, 250);

    ScrollTrigger.create({
      trigger: "#how-it-works",
      start: "top 80%",
      snap: false
    });


    return () => {
      clearTimeout(t);
      // remove any lingering triggers if component unmounts
      try {
        ScrollTrigger.getAll().forEach((s) => s.kill());
      } catch (e) {
        console.warn("Error cleaning up ScrollTriggers:", e);
      }
    };
  }, []);

  // If you still need more room, increase this value.
  const SPACER_HEIGHT_PX = 3000; // <-- adjust if needed

  return (
    <SmoothScroll>
      <main className="bg-primary text-white overflow-x-hidden">
        <div className="flex flex-col items-center justify-center w-full overflow-hidden">
          {/* === HERO === */}
          <section id="hero" className="w-full min-h-screen">
            <HeroSection />
          </section>

          {/* === HOW IT WORKS === */}
          <section id="how-it-works" className="w-full min-h-screen">
            <HowItWorksSection />
          </section>

          {/* === TRENDING === */}
          <section id="trending" className="w-full">
            <TrendingCampaignsSection />
          </section>

          {/* === MASSIVE SPACER === */}
          <div
            aria-hidden="true"
            style={{
              height: `${SPACER_HEIGHT_PX}px`,
              width: "100%",
            }}
            className="bg-transparent"
          />

          {/* End of page — no footer or wallet CTA */}
        </div>
      </main>
    </SmoothScroll>
  );
}

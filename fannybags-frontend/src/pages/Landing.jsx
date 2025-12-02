import SmoothScroll from "../components/landing/SmoothScroll";
import HeroSection from "../components/landing/HeroSection";
import HowItWorksSection from "../components/landing/HowItWorksSection";
import TrendingCampaignsSection from "../components/landing/TrendingCampaignsSection";
import Footer from "../components/landing/Footer";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import DashboardTransition from "../components/transitions/DashboardTransition";

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
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
      try {
        ScrollTrigger.getAll().forEach((s) => s.kill());
      } catch (e) {
        console.warn("Error cleaning up ScrollTriggers:", e);
      }
    };
  }, []);

  const handleMakeMeMoney = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Start transition animation
    setIsTransitioning(true);
  };

  const handleTransitionComplete = () => {
    // Navigate after animation completes
    navigate('/app/dashboard');
    setIsTransitioning(false);
  };

  const SPACER_HEIGHT_PX = 3000;

  if (isTransitioning) {
    return (
      <DashboardTransition 
        isTransitioning={true} 
        onComplete={handleTransitionComplete}
      />
    );
  }

  return (
    <SmoothScroll>
      <main className="bg-primary text-white overflow-x-hidden min-h-screen w-screen">
        {/* Make Me Money Button - Fixed Top Right */}
        {handleMakeMeMoney}

        <div className="flex flex-col items-center justify-center w-full overflow-hidden">
          <section id="hero" className="w-full min-h-screen">
            <HeroSection />
          </section>

          <section id="how-it-works" className="w-full min-h-screen">
            <HowItWorksSection />
          </section>

          <section id="trending" className="w-full">
            <TrendingCampaignsSection />
          </section>

          <div
            aria-hidden="true"
            style={{ height: `${SPACER_HEIGHT_PX}px`, width: "100%" }}
            className="bg-transparent"
          />
          
          <section id="footer" className="w-full">
            <Footer />
          </section>
        </div>
      </main>
    </SmoothScroll>
  );
}
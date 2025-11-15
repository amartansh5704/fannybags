import GradientBlinds from "../reactbits/backgrounds/GradientBlinds";

export default function Footer() {
  return (
    <footer className="w-full relative bg-black pt-16">
      {/* GradientBlinds Background with CTA */}
      <div style={{ width: "100%", height: "400px", position: "relative" }} className="mb-8">
        <div style={{ pointerEvents: "auto" }}>
          <GradientBlinds
            gradientColors={["#FF9FFC", "#5227FF"]}
            angle={0}
            noise={0.2}
            blindCount={12}
            blindMinWidth={50}
            spotlightRadius={0.35}
            spotlightSoftness={1}
            spotlightOpacity={1}
            mouseDampening={0.15}
            distortAmount={0}
            shineDirection="left"
            mixBlendMode="lighten"
          />
        </div>
        
        {/* CTA Overlay - Below GradientBlinds */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 gap-8 pointer-events-none">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 drop-shadow-lg" style={{ textShadow: "0 2px 8px rgba(255,255,255,0.5)" }}>
              Ready to Invest in Music?
            </h2>
            <p className="text-lg text-black/90 drop-shadow-md" style={{ textShadow: "0 1px 4px rgba(255,255,255,0.4)" }}>
              Discover amazing artists and earn from their success
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pointer-events-auto">
            <button className="px-8 py-3 bg-accent hover:bg-accent/90 text-black font-bold rounded-lg transition transform hover:scale-105 drop-shadow-lg">
              🔍 Find Songs
            </button>
            <button className="px-8 py-3 bg-black/60 hover:bg-black/70 text-white font-bold rounded-lg transition transform hover:scale-105 backdrop-blur-sm drop-shadow-lg border border-white/30">
              📝 Sign Up
            </button>
            <button className="px-8 py-3 bg-black/60 hover:bg-black/70 text-white font-bold rounded-lg transition transform hover:scale-105 backdrop-blur-sm drop-shadow-lg border border-white/30">
              🔑 Login
            </button>
          </div>
        </div>
      </div>

      {/* Footer Content */}
      <div className="px-6 py-16 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">FannyBags</h3>
              <p className="text-white/60 text-sm">
                Revolutionizing music investing. Support artists, own the future.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-accent transition">
                    Explore
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition">
                    For Artists
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition">
                    For Investors
                  </a>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-accent transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition">
                    Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-accent transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-white/50">
            <p>&copy; 2025 FannyBags. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-accent transition">
                Twitter
              </a>
              <a href="#" className="hover:text-accent transition">
                Discord
              </a>
              <a href="#" className="hover:text-accent transition">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
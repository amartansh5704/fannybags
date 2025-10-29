import { useNavigate } from 'react-router-dom';
import ClickSpark from '../reactbits/animations/ClickSpark';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-[hsl(260,30%,8%)] to-[hsl(260,30%,3%)] border-t border-white/10">
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[hsl(320,100%,60%,0.1)] via-[hsl(260,40%,20%,0.1)] to-[hsl(150,100%,50%,0.1)] border-b border-[hsl(320,100%,60%,0.1)] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-black mb-4">Ready to invest in music?</h3>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of investors earning revenue share</p>
          <ClickSpark sparkColor="#FF48B9" sparkRadius={40} sparkCount={12}>
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 bg-gradient-to-r from-[hsl(320,100%,60%)] to-[hsl(150,100%,50%)] text-[hsl(260,30%,10%)] rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-[hsl(320,100%,60%,0.5)] transition-all transform hover:scale-105"
            >
              Get Started Free
            </button>
          </ClickSpark>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: About */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <span className="text-xl">🎵</span>
              FannyBags
            </h4>
            <p className="text-gray-400 text-sm">
              Music funding reimagined. Invest in artists and earn revenue share.
            </p>
          </div>

          {/* Column 2: Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
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
                <button
                  onClick={() => navigate('/register')}
                  className="hover:text-white transition text-left"
                >
                  Create Campaign
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
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
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
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

        {/* Divider */}
        <div className="border-t border-white/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {currentYear} FannyBags. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                aria-label="Twitter"
                className="text-gray-400 hover:text-white transition"
              >
                Twitter
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="text-gray-400 hover:text-white transition"
              >
                Instagram
              </a>
              <a
                href="#"
                aria-label="Discord"
                className="text-gray-400 hover:text-white transition"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
import { useNavigate } from 'react-router-dom';
import TrendingSection from '../components/landing/TrendingSection';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-6">
            Invest in <span style={{ color: '#FF48B9' }}>Music</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            FannyBags lets you invest in your favorite songs and earn revenue share when they blow up.
          </p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-8 py-3 bg-fb-pink text-white rounded font-semibold hover:opacity-90 transition"
          >
            Explore Campaigns
          </button>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-fb-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-fb-pink mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Browse Songs</h3>
              <p className="text-gray-400">Discover amazing artists and their upcoming tracks.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-fb-pink mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Invest</h3>
              <p className="text-gray-400">Buy partitions and own a piece of the revenue.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-fb-pink mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Earn</h3>
              <p className="text-gray-400">Get paid when the song generates revenue.</p>
            </div>
          </div>
        </div>
      </div>
      {/* --- ADD THIS NEW SECTION --- */}
      <TrendingSection />
      {/* --- END OF NEW SECTION --- */}

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-8">Ready to Invest?</h2>
        <button
          onClick={() => navigate('/register')}
          className="px-8 py-3 bg-fb-green text-white rounded font-semibold hover:opacity-90 transition"
        >
          Get Started Now
        </button>
      </div>
    </div>
  );
}
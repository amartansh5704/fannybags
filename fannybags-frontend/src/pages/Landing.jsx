import { useNavigate } from 'react-router-dom';
import TrendingSection from '../components/landing/TrendingSection';
import ShinyText from '../components/reactbits/text/ShinyText';
import BlurText from '../components/reactbits/text/BlurText';
import CountUp from '../components/reactbits/text/CountUp';
import ClickSpark from '../components/reactbits/animations/ClickSpark';
import ParticlesBackground from '../components/reactbits/backgrounds/ParticlesBackground';
import FadeContent from '../components/reactbits/animations/FadeContent';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Particles Background */}
        <ParticlesBackground 
          particleCount={40} 
          colors={['#FF48B9', '#50207A', '#12CE6A']} 
        />
        
        {/* Hero Content */}
        <FadeContent duration={1200} className="text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6">
            <ShinyText text="Invest in Music" speed={3} />
          </h1>
          <BlurText
            text="FannyBags lets you invest in your favorite songs and earn revenue share when they blow up."
            delay={50}
            animateBy="words"
            direction="top"
            className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          />
          <ClickSpark sparkColor="#12CE6A" sparkRadius={30} sparkCount={10}>
            <button
              onClick={() => navigate('/campaigns')}
              className="px-8 py-3 bg-fb-pink text-white rounded font-semibold hover:opacity-90 transition"
            >
              Explore Campaigns
            </button>
          </ClickSpark>
        </FadeContent>
      </div>

      {/* How It Works */}
      <div className="bg-fb-surface py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeContent duration={1000}>
            <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          </FadeContent>
          <div className="grid md:grid-cols-3 gap-8">
            <FadeContent duration={800} delay={100}>
              <div className="text-center">
                <div className="text-4xl font-bold text-fb-pink mb-4">
                  <CountUp from={0} to={1} duration={1.5} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Browse Songs</h3>
                <p className="text-gray-400">Discover amazing artists and their upcoming tracks.</p>
              </div>
            </FadeContent>

            <FadeContent duration={800} delay={200}>
              <div className="text-center">
                <div className="text-4xl font-bold text-fb-pink mb-4">
                  <CountUp from={0} to={2} duration={1.5} delay={0.2} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Invest</h3>
                <p className="text-gray-400">Buy partitions and own a piece of the revenue.</p>
              </div>
            </FadeContent>

            <FadeContent duration={800} delay={300}>
              <div className="text-center">
                <div className="text-4xl font-bold text-fb-pink mb-4">
                  <CountUp from={0} to={3} duration={1.5} delay={0.4} />
                </div>
                <h3 className="text-xl font-semibold mb-2">Earn</h3>
                <p className="text-gray-400">Get paid when the song generates revenue.</p>
              </div>
            </FadeContent>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <TrendingSection />

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <FadeContent duration={1000}>
          <h2 className="text-4xl font-bold mb-8">Ready to Invest?</h2>
          <ClickSpark sparkColor="#FF48B9" sparkRadius={30} sparkCount={12}>
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-3 bg-fb-green text-white rounded font-semibold hover:opacity-90 transition"
            >
              Get Started Now
            </button>
          </ClickSpark>
        </FadeContent>
      </div>
    </div>
  );
}
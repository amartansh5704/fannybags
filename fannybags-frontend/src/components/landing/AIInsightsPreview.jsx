import { useNavigate } from 'react-router-dom';
import FadeContent from '../reactbits/animations/FadeContent';
import GlassCard from '../reactbits/components/GlassCard';
import ClickSpark from '../reactbits/animations/ClickSpark';

export default function AIInsightsPreview() {
  const navigate = useNavigate();

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient accents */}
      <div className="absolute left-0 top-1/2 w-96 h-96 bg-[#50207A]/10 rounded-full blur-3xl -z-10" />
      <div className="absolute right-0 bottom-1/4 w-96 h-96 bg-fb-green/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto">
        <FadeContent duration={1000} delay={0}>
          <GlassCard
            blur="lg"
            border={true}
            className="p-12 md:p-16 bg-gradient-to-br from-[#50207A]/20 to-fb-pink/10 border-fb-pink/40 hover:border-fb-pink/70 transition-all overflow-hidden group"
          >
            {/* Animated glow background */}
            <div className="absolute inset-0 bg-gradient-to-r from-fb-pink/0 via-fb-pink/5 to-fb-green/0 group-hover:via-fb-pink/10 transition-all duration-300 -z-10" />

            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              {/* Left: Content */}
              <div>
                <div className="inline-block px-4 py-2 bg-fb-green/10 rounded-full border border-fb-green/30 mb-6">
                  <span className="text-fb-green font-semibold text-sm">🤖 AI POWERED</span>
                </div>

                <h3 className="text-4xl font-black mb-4">
                  Revenue <span className="text-transparent bg-clip-text bg-gradient-to-r from-fb-pink to-fb-green">Predictions</span>
                </h3>

                <p className="text-gray-400 text-lg mb-6 leading-relaxed">
                  Our AI analyzes artist metrics, market trends, and music data to predict revenue potential. Make smarter investment decisions.
                </p>

                {/* Feature list */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-fb-green">✓</span> Real-time market analysis
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-fb-green">✓</span> Artist growth tracking
                  </li>
                  <li className="flex items-center gap-3 text-gray-300">
                    <span className="text-fb-green">✓</span> Predictive ROI scoring
                  </li>
                </ul>

                {/* CTA */}
                <ClickSpark sparkColor="#12CE6A" sparkRadius={30} sparkCount={8}>
                  <button
                    onClick={() => navigate('/ai-predictor')}
                    className="px-8 py-3 bg-gradient-to-r from-fb-green to-emerald-500 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-fb-green/50 transition-all inline-flex items-center gap-2"
                  >
                    Try AI Predictor
                    <span>→</span>
                  </button>
                </ClickSpark>
              </div>

              {/* Right: Visual */}
              <div className="hidden md:block relative">
                <div className="relative w-full h-64 bg-gradient-to-br from-fb-pink/20 to-fb-green/20 rounded-xl border border-fb-green/30 flex items-center justify-center group-hover:border-fb-green/60 transition-all">
                  {/* Animated chart visualization */}
                  <div className="space-y-2 w-3/4">
                    <div className="h-2 bg-fb-green/30 rounded w-3/4 group-hover:w-4/5 transition-all" />
                    <div className="h-2 bg-fb-pink/30 rounded w-4/5 group-hover:w-full transition-all" />
                    <div className="h-2 bg-fb-green/20 rounded w-2/3 group-hover:w-3/4 transition-all" />
                  </div>

                  {/* Glowing orbs */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-fb-pink rounded-full animate-pulse" />
                  <div className="absolute bottom-4 left-4 w-2 h-2 bg-fb-green rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>
              </div>
            </div>
          </GlassCard>
        </FadeContent>
      </div>
    </section>
  );
}
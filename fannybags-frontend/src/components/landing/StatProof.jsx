import CountUp from '../reactbits/text/CountUp';
import FadeContent from '../reactbits/animations/FadeContent';

export default function StatProof() {
  // Mocked stats. When backend exposes `/stats` endpoint, fetch here with useEffect.
  const stats = {
    totalInvested: 2000000,
    activeCampaigns: 50,
    averageROI: 12.5,
  };

  return (
    <div className="bg-fb-dark py-16 border-t border-b border-fb-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Stat 1: Total Invested */}
          <FadeContent duration={1000} delay={0}>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-fb-pink/10 to-transparent">
              <div className="text-4xl font-bold text-fb-pink mb-2">
                $<CountUp from={0} to={stats.totalInvested / 1000000} duration={2.5} />M+
              </div>
              <p className="text-gray-400">Total Invested</p>
              <p className="text-sm text-gray-500 mt-2">By our community of investors</p>
            </div>
          </FadeContent>

          {/* Stat 2: Active Campaigns */}
          <FadeContent duration={1000} delay={100}>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-fb-green/10 to-transparent">
              <div className="text-4xl font-bold text-fb-green mb-2">
                <CountUp from={0} to={stats.activeCampaigns} duration={2.5} />+
              </div>
              <p className="text-gray-400">Active Campaigns</p>
              <p className="text-sm text-gray-500 mt-2">Songs funding right now</p>
            </div>
          </FadeContent>

          {/* Stat 3: Average ROI */}
          <FadeContent duration={1000} delay={200}>
            <div className="text-center p-6 rounded-lg bg-gradient-to-br from-fb-purple/10 to-transparent">
              <div className="text-4xl font-bold text-fb-purple mb-2">
                <CountUp from={0} to={stats.averageROI} duration={2.5} decimals={1} />%
              </div>
              <p className="text-gray-400">Average ROI</p>
              <p className="text-sm text-gray-500 mt-2">Historical average return</p>
            </div>
          </FadeContent>
        </div>
      </div>
    </div>
  );
}
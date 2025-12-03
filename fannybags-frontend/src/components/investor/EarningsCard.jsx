import { IoTrendingUp, IoMusicalNotes, IoCheckmarkCircle } from 'react-icons/io5';

export default function EarningsCard({ holding, actualEarnings = 0 }) {
  const investmentAmount = holding?.investment_amount || 0;
  const expectedReturn = holding?.expected_return_3m || 0;
  const partitionsOwned = holding?.partitions_owned || 0;
  const campaignStatus = holding?.campaign_status || 'active';
  
  const roi = investmentAmount > 0 
    ? ((actualEarnings / investmentAmount) * 100).toFixed(2)
    : 0;
  
  const isProfitable = actualEarnings > 0;

  // 🎨 Campaign artwork - NOW IT WILL WORK!
  const artworkUrl = holding?.campaign_artwork_url;
  const fullArtworkUrl = artworkUrl 
    ? `${import.meta.env.VITE_API_BASE_URL|| 'http://127.0.0.1:5000'}${artworkUrl}`
    : null;

  return (
    <div
      className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'radial-gradient(circle at 0% 0%, rgba(34,197,94,0.12) 0%, transparent 60%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.97))',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(34,197,94,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(34,197,94,0.15)'
      }}
    >
      {/* Artwork Section */}
      <div className="relative h-48 overflow-hidden bg-black/40">
        {fullArtworkUrl ? (
          <img
            src={fullArtworkUrl}
            alt={holding?.campaign_title || 'Campaign'}
            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'flex';
            }}
          />
        ) : null}
        
        {/* Fallback gradient - shown if no image OR on error */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-[#22C55E] via-[#10B981] to-[#059669] flex items-center justify-center"
          style={{ display: fullArtworkUrl ? 'none' : 'flex' }}
        >
          <IoMusicalNotes className="text-white/40 text-6xl" />
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* ROI Badge - Top Right */}
        <div
          className="absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md z-10"
          style={{
            background: isProfitable 
              ? 'linear-gradient(135deg, rgba(34,197,94,0.9), rgba(16,185,129,0.9))'
              : 'rgba(100,116,139,0.7)',
            boxShadow: isProfitable 
              ? '0 0 20px rgba(34,197,94,0.6)'
              : '0 0 10px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
        >
          <span className="flex items-center gap-1">
            {isProfitable && <IoTrendingUp />}
            {roi}% ROI
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        
        {/* Campaign Title */}
        <h3 className="text-lg font-bold text-white truncate">
          {holding?.campaign_title || 'Untitled Campaign'}
        </h3>

        {/* Actual Earnings - Big Display */}
        <div className="py-4 px-5 rounded-2xl" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(34,197,94,0.15), transparent)',
          border: '1px solid rgba(34,197,94,0.25)'
        }}>
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
            Actual Earnings
          </p>
          <p
            className="text-3xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #22C55E, #6EE7B7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 30px rgba(34,197,94,0.3)'
            }}
          >
            ₹{actualEarnings.toLocaleString()}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Invested */}
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Invested</p>
            <p className="text-sm font-semibold text-white">
              ₹{investmentAmount.toLocaleString()}
            </p>
          </div>

          {/* Expected 3M */}
          <div className="bg-white/5 rounded-xl p-3">
            <p className="text-xs text-gray-400 mb-1">Expected (3M)</p>
            <p className="text-sm font-semibold text-emerald-300">
              ₹{expectedReturn.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Partitions</span>
            <span className="text-white font-semibold">{partitionsOwned}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Status</span>
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold capitalize"
              style={{
                background: 'rgba(34,197,94,0.2)',
                color: '#6EE7B7',
                border: '1px solid rgba(34,197,94,0.4)'
              }}
            >
              {campaignStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
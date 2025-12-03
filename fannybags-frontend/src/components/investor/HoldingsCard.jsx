import { useNavigate } from 'react-router-dom';
import { IoMusicalNotes, IoWallet, IoPieChart, IoCalendarOutline } from 'react-icons/io5';

export default function HoldingsCard({ holding }) {
  const navigate = useNavigate();

  // ✅ Using EXACT original field names
  const investmentAmount = holding?.investment_amount || 0;
  const expectedReturn = holding?.expected_return_3m || 0;
  const partitionsOwned = holding?.partitions_owned || 0;
  const campaignStatus = holding?.campaign_status || 'N/A';
  const artistName = holding?.artist_name || 'Unknown Artist';
  const campaignId = holding?.campaign_id;
  const dateInvested = holding?.date_invested;

  // 🎨 Campaign artwork
  const artworkUrl = holding?.campaign_artwork_url
    ? `${import.meta.env.VITE_BACKEND_URL|| 'http://127.0.0.1:5000'}${holding.campaign_artwork_url}`
    : null;

  return (
    <div
      onClick={() => campaignId && navigate(`/app/campaign/${campaignId}`)}
      className="group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
      style={{
        background: 'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.12) 0%, transparent 60%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.97))',
        backdropFilter: 'blur(32px)',
        border: '1px solid rgba(139,92,246,0.3)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(139,92,246,0.15)'
      }}
    >
      {/* Album Art */}
      <div className="relative aspect-square overflow-hidden bg-black/40">
        {artworkUrl ? (
          <img
            src={artworkUrl}
            alt={holding?.campaign_title || 'Campaign'}
            className="w-full h-full object-cover opacity-90 group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] via-[#A78BFA] to-[#C4B5FD] flex items-center justify-center">
            <IoMusicalNotes className="text-white/40 text-7xl" />
          </div>
        )}
        
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        
        {/* Title + Artist */}
        <div>
          <h3 className="text-lg font-bold text-white truncate mb-1">
            {holding?.campaign_title || 'Untitled Campaign'}
          </h3>
          <p className="text-sm text-gray-400">by {artistName}</p>
        </div>

        {/* Investment Amount - Featured */}
        <div className="py-4 px-5 rounded-2xl" style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(139,92,246,0.15), transparent)',
          border: '1px solid rgba(139,92,246,0.3)'
        }}>
          <div className="flex items-center gap-2 mb-1">
            <IoWallet className="text-purple-400 text-sm" />
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Your Investment
            </p>
          </div>
          <p
            className="text-2xl font-black tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C4B5FD)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            ₹{investmentAmount.toLocaleString()}
          </p>
        </div>

        {/* Details Grid */}
        <div className="space-y-3">
          
          {/* Partitions */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5">
            <div className="flex items-center gap-2">
              <IoPieChart className="text-purple-400 text-sm" />
              <span className="text-xs text-gray-400">Partitions</span>
            </div>
            <span className="text-sm font-semibold text-white">
              {partitionsOwned}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/5">
            <span className="text-xs text-gray-400">Status</span>
            <span
              className="px-2 py-1 rounded-full text-xs font-semibold capitalize"
              style={{
                background: 'rgba(255,72,185,0.2)',
                color: '#FF48B9',
                border: '1px solid rgba(255,72,185,0.4)'
              }}
            >
              {campaignStatus}
            </span>
          </div>

          {/* Expected Return */}
          <div className="py-3 px-4 rounded-xl" style={{
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.3)'
          }}>
            <p className="text-xs text-gray-400 mb-1">Expected Return (3M)</p>
            <p className="text-xl font-bold text-emerald-300">
              ₹{expectedReturn.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Date Invested */}
        {dateInvested && (
          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <IoCalendarOutline className="text-sm" />
              <span>Invested on {new Date(dateInvested).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
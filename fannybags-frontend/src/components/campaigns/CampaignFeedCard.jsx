import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMusicalNotes, IoShareSocial } from 'react-icons/io5';

export default function CampaignFeedCard({ campaign}) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const fundingPercentage = (campaign.amount_raised / campaign.target_amount) * 100;
  const partitionsSold = campaign.partitions_sold || 0;
  const availablePartitions = campaign.total_partitions - partitionsSold;

  return (
    <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden hover:border-[rgba(255,72,185,0.3)] transition-all duration-300">
      {/* Header with Artwork */}
      <div className="relative h-48 bg-gradient-to-br from-[#FF48B9] to-[#8B5CF6] overflow-hidden group">
        {campaign.artwork_url ? (
          <img 
            src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${campaign.artwork_url}`}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IoMusicalNotes className="text-6xl text-white/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
            campaign.funding_status === 'live' 
              ? 'bg-[rgba(18,206,106,0.2)] text-[#12CE6A] border border-[#12CE6A]' 
              : 'bg-[rgba(255,255,255,0.1)] text-white border border-white/30'
          }`}>
            {campaign.funding_status?.toUpperCase() || 'ACTIVE'}
          </span>
        </div>

        {/* Audio Preview */}
        {campaign.audio_preview_url && (
          <div className="absolute bottom-2 left-2 right-2">
            <audio 
              controls 
              className="w-full h-8 opacity-90 hover:opacity-100 transition-opacity"
              src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${campaign.audio_preview_url}`}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title & Artist */}
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{campaign.title}</h3>
        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{campaign.description}</p>

        {/* Funding Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-2xl font-bold text-white">
              ₹{campaign.amount_raised?.toLocaleString() || '0'}
            </span>
            <span className="text-sm text-gray-400">
              {fundingPercentage.toFixed(0)}% funded
            </span>
          </div>
          <div className="w-full h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF48B9] to-[#12CE6A] transition-all duration-500"
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Goal: ₹{campaign.target_amount?.toLocaleString() || '0'}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-lg">
            <p className="text-xs text-gray-400">Revenue Share</p>
            <p className="text-lg font-bold text-[#12CE6A]">{campaign.revenue_share_pct}%</p>
          </div>
          <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-lg">
            <p className="text-xs text-gray-400">Price/Share</p>
            <p className="text-lg font-bold text-white">₹{campaign.partition_price}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowDetails(true)}
            disabled={availablePartitions <= 0}
            className="flex-1 bg-[#FF48B9] text-white py-3 rounded-lg font-semibold hover:bg-[#ff5bc4] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {availablePartitions > 0 ? 'Invest Now' : 'Sold Out'}
          </button>
          <button
            onClick={() => navigate(`/campaign/${campaign.id}`)}
            className="px-4 bg-[rgba(255,255,255,0.05)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
          >
            <IoShareSocial className="text-xl" />
          </button>
        </div>

        {/* Available Partitions */}
        <p className="text-xs text-gray-500 mt-3 text-center">
          {availablePartitions} of {campaign.total_partitions} shares available
        </p>
      </div>

      {/* Investment Modal Trigger */}
      {showDetails && (
        <div 
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div 
            className="bg-[#0A0A0A] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Invest in {campaign.title}</h2>
            <p className="text-gray-400 mb-6">
              Full investment form would go here. For now, clicking will navigate to campaign detail page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDetails(false);
                  navigate(`/campaign/${campaign.id}`);
                }}
                className="flex-1 bg-[#FF48B9] text-white py-3 rounded-lg font-semibold hover:bg-[#ff5bc4] transition-all"
              >
                View Full Details
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 bg-[rgba(255,255,255,0.05)] text-white rounded-lg hover:bg-[rgba(255,255,255,0.1)] transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
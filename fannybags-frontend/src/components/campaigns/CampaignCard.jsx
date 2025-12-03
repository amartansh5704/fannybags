import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import StatusBadge from '../common/StatusBadge';
import { getCampaignStatus } from '../../utils/campaignUtils';
import { IoShareSocial } from 'react-icons/io5';
import ShareModal from '../common/ShareModal';

const CampaignBadge = ({ text, icon, colorClass }) => (
  <div className={`absolute top-2 left-2 flex items-center gap-1.5 rounded-full ${colorClass} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
    {icon}
    <span>{text}</span>
  </div>
);

export default function CampaignCard({ campaign, isFeatured, isTrending }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showShare, setShowShare] = useState(false);

  // 🔥 Detect if we're in vertical layout
  const isVerticalLayout = location.pathname.startsWith('/app');

  const amountRaised = campaign.amount_raised || 0;
  const targetAmount = campaign.target_amount || 1;
  const partitionPrice = campaign.partition_price || 0;
  const revenueSharePct = campaign.revenue_share_pct || 0;
  const percentage = (amountRaised / targetAmount) * 100;
  const status = getCampaignStatus(campaign);
  
  const artworkUrl = campaign.artwork_url 
    ? `${import.meta.env.VITE_API_BASE_URL|| 'http://127.0.0.1:5000'}${campaign.artwork_url}`
    : null;
    
  const audioUrl = campaign.audio_preview_url
    ? `${import.meta.env.VITE_API_BASE_URL|| 'http://127.0.0.1:5000'}${campaign.audio_preview_url}`
    : null;

  // 🔥 Dynamic navigation based on layout
  const handleCardClick = () => {
    const targetPath = isVerticalLayout 
      ? `/app/campaign/${campaign.id}` 
      : `/app/campaign/${campaign.id}`;
    navigate(targetPath);
  };

  const shareUrl = `${window.location.origin}/app/campaign/${campaign.id}`;

  return (
    <>
      <div
        onClick={handleCardClick}
        className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden cursor-pointer hover:border-[rgba(255,72,185,0.3)] hover:transform hover:scale-105 transition-all duration-300"
      >
        {/* Artwork */}
        <div className="relative h-48 bg-gradient-to-br from-[#FF48B9] to-[#8B5CF6]">
          {artworkUrl ? (
            <img 
              src={artworkUrl} 
              alt={campaign.title || 'Campaign'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.querySelector('.fallback-icon').style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="fallback-icon absolute inset-0 flex items-center justify-center"
            style={{ display: artworkUrl ? 'none' : 'flex' }}
          >
            <span className="text-6xl">🎵</span>
          </div>
          
          {isFeatured ? (
            <CampaignBadge 
              text="Editor's Pick" 
              icon="⭐" 
              colorClass="bg-yellow-500" 
            />
          ) : isTrending ? (
            <CampaignBadge 
              text="Trending" 
              icon="🔥" 
              colorClass="bg-[#FF48B9]" 
            />
          ) : null}
          
          <div className="absolute top-2 right-2">
            <StatusBadge status={status} />
          </div>
          
          {audioUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const audio = document.getElementById(`audio-${campaign.id}`);
                if (audio.paused) {
                  document.querySelectorAll('audio').forEach(a => a.pause());
                  audio.play();
                } else {
                  audio.pause();
                }
              }}
              className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/90 transition"
              title="Play preview"
            >
              🎧
            </button>
          )}
          
          {audioUrl && (
            <audio id={`audio-${campaign.id}`} src={audioUrl} loop={false} />
          )}
        </div>

        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 truncate text-white">{campaign.title || 'Untitled Campaign'}</h3>
          
          {campaign.artist_name && (
            <p className="text-sm text-[#FF48B9] mb-2">
              by {campaign.artist_name}
            </p>
          )}
          
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {campaign.description || 'No description'}
          </p>

          <div className="mb-4">
            <ProgressBar 
              raised={amountRaised}
              target={targetAmount}
              percentage={percentage}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-xs">Raised</p>
              <p className="font-bold text-white">₹{amountRaised.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Per Share</p>
              <p className="font-bold text-white">₹{partitionPrice.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm text-gray-400 pt-3 border-t border-gray-700">
            <span className="text-[#12CE6A]">{revenueSharePct}% revenue share</span>
            
            <div className="flex items-center gap-4">
              {campaign.artist_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/artist/${campaign.artist_id}`);
                  }}
                  className="text-[#FF48B9] hover:text-white text-sm font-semibold"
                >
                  View Artist
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowShare(true);
                }}
                className="text-gray-400 hover:text-white"
                title="Share Campaign"
              >
                <IoShareSocial size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showShare && (
        <ShareModal
          title={campaign.title}
          url={shareUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
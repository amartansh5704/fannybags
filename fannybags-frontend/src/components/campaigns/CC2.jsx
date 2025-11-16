import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../common/ProgressBar';
import StatusBadge from '../common/StatusBadge';
import { getCampaignStatus } from '../../utils/campaignUtils';
import { IoShareSocial } from 'react-icons/io5'; // <-- ADDED
import ShareModal from '../common/ShareModal'; // <-- ADDED

// Reusable Badge component for our cards
const CampaignBadge = ({ text, icon, colorClass }) => (
  <div className={`absolute top-2 left-2 flex items-center gap-1.5 rounded-full ${colorClass} px-3 py-1 text-xs font-bold text-white shadow-lg`}>
    {icon}
    <span>{text}</span>
  </div>
);

export default function CampaignCard({ campaign, isFeatured, isTrending }) {
  const navigate = useNavigate();
  const [showShare, setShowShare] = useState(false); // <-- ADDED

  // 🔥 SAFETY: Extract values with fallbacks
  const amountRaised = campaign.amount_raised || 0;
  const targetAmount = campaign.target_amount || 1;
  const partitionPrice = campaign.partition_price || 0;
  const revenueSharePct = campaign.revenue_share_pct || 0;
  const percentage = (amountRaised / targetAmount) * 100;
  const status = getCampaignStatus(campaign);
  
  // 🔥 Build full URLs for artwork and audio
  const artworkUrl = campaign.artwork_url 
    ? `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${campaign.artwork_url}`
    : null;
    
  const audioUrl = campaign.audio_preview_url
    ? `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${campaign.audio_preview_url}`
    : null;

  // --- DEFINE THE SHARE URL ---
  // We build the full path. window.location.origin gives us "http://localhost:5173"
  const shareUrl = `${window.location.origin}/campaign/${campaign.id}`; // <-- ADDED

  return (
    <> {/* <-- CHANGED TO FRAGMENT */}
      <div
        onClick={() => navigate(`/campaign/${campaign.id}`)}
        className="bg-fb-surface rounded-lg overflow-hidden cursor-pointer hover:transform hover:scale-105 transition-transform duration-300 shadow-lg"
      >
        {/* Album Art Container - Updated with artwork */}
        <div className="relative h-48 bg-gradient-to-r from-fb-purple to-fb-pink">
          {artworkUrl ? (
            <img 
              src={artworkUrl} 
              alt={campaign.title || 'Campaign'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback if image fails to load
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
          
          {/* --- NEW BADGE LOGIC --- */}
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
              colorClass="bg-fb-pink" 
            />
          ) : null}
          
          {/* Status Badge - Positioned on top-right of image */}
          <div className="absolute top-2 right-2">
            <StatusBadge status={status} />
          </div>
          
          {/* Audio Preview Button */}
          {audioUrl && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const audio = document.getElementById(`audio-${campaign.id}`);
                if (audio.paused) {
                  // Stop all other audio
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
          
          {/* Hidden Audio Element */}
          {audioUrl && (
            <audio id={`audio-${campaign.id}`} src={audioUrl} loop={false} />
          )}
        </div>

        <div className="p-6">
          {/* Campaign Title */}
          <h3 className="text-xl font-bold mb-2 truncate">{campaign.title || 'Untitled Campaign'}</h3>
          
          {/* Artist Name if available */}
          {campaign.artist_name && (
            <p className="text-sm text-fb-pink mb-2">
              by {campaign.artist_name}
            </p>
          )}
          
          {/* Campaign Description */}
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {campaign.description || 'No description'}
          </p>

          {/* Progress Bar Component */}
          <div className="mb-4">
            <ProgressBar 
              raised={amountRaised}
              target={targetAmount}
              percentage={percentage}
            />
          </div>

          {/* Campaign Stats - WITH SAFETY CHECKS */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-400 text-xs">Raised</p>
              <p className="font-bold">₹{amountRaised.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Per Share</p>
              <p className="font-bold">₹{partitionPrice.toLocaleString()}</p>
            </div>
          </div>

          {/* --- MODIFIED FOOTER --- */}
          <div className="flex justify-between items-center text-sm text-gray-400 pt-3 border-t border-gray-600">
            <span>{revenueSharePct}% revenue share</span>
            
            <div className="flex items-center gap-4">
              {/* Artist Button */}
              {campaign.artist_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // <-- IMPORTANT
                    navigate(`/artist/${campaign.artist_id}`);
                  }}
                  className="text-fb-pink hover:text-white text-sm font-semibold"
                >
                  View Artist
                </button>
              )}
              
              {/* Share Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // <-- CRITICAL: Prevents card click-through
                  setShowShare(true);
                }}
                className="text-gray-400 hover:text-white"
                title="Share Campaign"
              >
                <IoShareSocial size={20} />
              </button>
            </div>
          </div>
          {/* --- END OF MODIFICATION --- */}

        </div>
      </div>

      {/* --- ADDED THIS MODAL --- */}
      {showShare && (
        <ShareModal
          title={campaign.title}
          url={shareUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </> // <-- CHANGED TO FRAGMENT
  );
} 
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';
import FilterPanel from '../components/common/FilterPanel';

export default function CampaignBrowse() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Function to determine campaign status
  const getCampaignStatus = (campaign) => {
    const today = new Date();
    
    // Handle null dates gracefully
    const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
    const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
    
    const amountRaised = campaign.amount_raised || 0;
    const targetAmount = campaign.target_amount || 1;
    const percentage = (amountRaised / targetAmount) * 100;

    // If campaign has ended
    if (endDate && today > endDate) {
      return percentage >= 100 ? 'successful' : 'failed';
    }
    
    // If campaign hasn't started
    if (startDate && today < startDate) {
      return 'upcoming';
    }
    
    // Campaign is currently active
    return 'active';
  };

  // Function to apply filters
  const applyFilters = (campaigns, filters) => {
    let filtered = [...campaigns];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title?.toLowerCase().includes(searchTerm) ||
        campaign.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Genre filter (we'll add genre to campaigns later)
    if (filters.genre) {
      // For now, we'll skip genre filtering since we don't have genre data
      // filtered = filtered.filter(campaign => campaign.genre === filters.genre);
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(campaign => {
        const price = campaign.partition_price || 0;
        switch (filters.priceRange) {
          case '1k-10k':
            return price >= 1000 && price <= 10000;
          case '10k-50k':
            return price >= 10000 && price <= 50000;
          case '50k+':
            return price >= 50000;
          default:
            return true;
        }
      });
    }

    // Sort filter
    switch (filters.sort) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'most_funded':
        filtered.sort((a, b) => (b.amount_raised || 0) - (a.amount_raised || 0));
        break;
      case 'ending_soon':
        filtered.sort((a, b) => {
          const aEnd = a.end_date ? new Date(a.end_date) : new Date('2099-12-31');
          const bEnd = b.end_date ? new Date(b.end_date) : new Date('2099-12-31');
          return aEnd - bEnd;
        });
        break;
      case 'lowest_price':
        filtered.sort((a, b) => (a.partition_price || 0) - (b.partition_price || 0));
        break;
      case 'highest_price':
        filtered.sort((a, b) => (b.partition_price || 0) - (a.partition_price || 0));
        break;
      default:
        break;
    }

    return filtered;
  };

  // Handle filter changes
  const handleFiltersChange = (filters) => {
    const filtered = applyFilters(campaigns, filters);
    setFilteredCampaigns(filtered);
  };

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns();
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (err) {
        setError('Failed to load campaigns');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-10">
          Explore <span style={{ color: '#FF48B9' }}>Campaigns</span>
        </h1>

        {/* Filter Panel */}
        <FilterPanel onFiltersChange={handleFiltersChange} />

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredCampaigns.length} of {campaigns.length} campaigns
          </p>
        </div>

        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No campaigns match your filters</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
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

              return (
                <div
                  key={campaign.id}
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                  className="bg-fb-surface rounded-lg overflow-hidden cursor-pointer hover:transform hover:scale-105 transition shadow-lg"
                >
                  {/* Album Art Container - Updated with artwork */}
                  <div className="relative h-48 bg-gradient-to-r from-fb-purple to-fb-pink">
                    {artworkUrl ? (
                      <img 
                        src={artworkUrl} 
                        alt={campaign.title || 'Campaign'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`${artworkUrl ? 'hidden' : 'flex'} absolute inset-0 items-center justify-center`}
                      style={{ display: artworkUrl ? 'none' : 'flex' }}
                    >
                      <span className="text-6xl">🎵</span>
                    </div>
                    
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
                      <audio id={`audio-${campaign.id}`} src={audioUrl} />
                    )}
                  </div>

                  <div className="p-6">
                    {/* Campaign Title */}
                    <h3 className="text-xl font-bold mb-2">{campaign.title || 'Untitled Campaign'}</h3>
                    
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

                    {/* Revenue Share Footer */}
                    <div className="flex justify-between text-sm text-gray-400 pt-3 border-t border-gray-600">
                      <span>{revenueSharePct}% revenue share</span>
                      <div className="flex gap-2">
                        {campaign.artist_id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/artist/${campaign.artist_id}`);
                            }}
                            className="text-fb-pink hover:text-white text-sm font-semibold"
                          >
                            View Artist →
                          </button>
                        )}
                        <span className="text-fb-pink">View Details →</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
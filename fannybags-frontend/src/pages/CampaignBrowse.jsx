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
    
    const percentage = (campaign.amount_raised / campaign.target_amount) * 100;

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
        campaign.title.toLowerCase().includes(searchTerm) ||
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
        const price = campaign.partition_price;
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
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'most_funded':
        filtered.sort((a, b) => b.amount_raised - a.amount_raised);
        break;
      case 'ending_soon':
        filtered.sort((a, b) => {
          const aEnd = a.end_date ? new Date(a.end_date) : new Date('2099-12-31');
          const bEnd = b.end_date ? new Date(b.end_date) : new Date('2099-12-31');
          return aEnd - bEnd;
        });
        break;
      case 'lowest_price':
        filtered.sort((a, b) => a.partition_price - b.partition_price);
        break;
      case 'highest_price':
        filtered.sort((a, b) => b.partition_price - a.partition_price);
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
              const percentage = (campaign.amount_raised / campaign.target_amount) * 100;
              const status = getCampaignStatus(campaign);

              return (
                <div
                  key={campaign.id}
                  onClick={() => navigate(`/campaign/${campaign.id}`)}
                  className="bg-fb-surface p-6 rounded-lg cursor-pointer hover:transform hover:scale-105 transition shadow-lg"
                >
                  {/* Album Art Container */}
                  <div className="mb-4 relative">
                    <div className="w-full h-40 bg-gradient-to-r from-fb-purple to-fb-pink rounded flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                    
                    {/* Status Badge - Positioned on top-right of image */}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={status} />
                    </div>
                  </div>

                  {/* Campaign Title */}
                  <h3 className="text-xl font-bold mb-2">{campaign.title}</h3>
                  
                  {/* Campaign Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {campaign.description || 'No description'}
                  </p>

                  {/* Progress Bar Component */}
                  <div className="mb-4">
                    <ProgressBar 
                      raised={campaign.amount_raised}
                      target={campaign.target_amount}
                      percentage={percentage}
                    />
                  </div>

                  {/* Revenue Share Footer */}
                  <div className="flex justify-between text-sm text-gray-400 pt-3 border-t border-gray-600">
                    <span>{campaign.revenue_share_pct}% revenue share</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/artist/${campaign.artist_id}`);
                        }}
                        className="text-fb-pink hover:text-white text-sm font-semibold"
                      >
                        View Artist →
                      </button>
                      <span className="text-fb-pink">View Details →</span>
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
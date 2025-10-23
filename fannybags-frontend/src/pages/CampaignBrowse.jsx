import { useEffect, useState } from 'react';
// We no longer import useNavigate here, it's in the card
import { campaignService } from '../services/campaignService';
// We no longer import ProgressBar or StatusBadge
import FilterPanel from '../components/common/FilterPanel';
// --- NEW IMPORTS ---
import CampaignCard from '../components/campaigns/CampaignCard'; // Import the new card

export default function CampaignBrowse() {
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // const navigate = useNavigate(); // No longer needed here

  // getCampaignStatus is now imported from utils!

  // Function to apply filters (remains the same)
  const applyFilters = (campaigns, filters) => {
    // ... (Your existing filter logic is fine, no changes needed)
    let filtered = [...campaigns];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title?.toLowerCase().includes(searchTerm) ||
        campaign.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Genre filter
    if (filters.genre) {
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

  // Handle filter changes (remains the same)
  const handleFiltersChange = (filters) => {
    // ... (no changes needed)
    const filtered = applyFilters(campaigns, filters);
    setFilteredCampaigns(filtered);
  };

  useEffect(() => {
    // ... (no changes needed)
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
    // ... (no changes needed)
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <p>Loading campaigns...</p>
      </div>
    );
  }

  if (error) {
    // ... (no changes needed)
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
             {/* ... (no changes needed) */}
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
            {/* --- THIS IS THE ONLY PART THAT CHANGES --- */}
            {filteredCampaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                // We don't pass badge props here,
                // so they will just be normal cards.
              />
            ))}
            {/* --- END OF CHANGED SECTION --- */}
          </div>
        )}
      </div>
    </div>
  );
}
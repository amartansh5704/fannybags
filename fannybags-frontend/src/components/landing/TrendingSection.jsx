import { useState, useEffect } from 'react';
import { campaignService } from '../../services/campaignService';
import CampaignCard from '../campaigns/CampaignCard';

export default function TrendingSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getTrendingCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error("Failed to fetch trending campaigns:", err);
        setError('Could not load trending campaigns.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-10">
        <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse mx-auto mb-4"></div>
        <div className="h-8 w-1/3 bg-gray-700 rounded animate-pulse mx-auto"></div>
      </div>
    );
  }

  if (error || campaigns.length === 0) {
    // Don't show an error on the homepage, just show nothing.
    return null; 
  }

  return (
    <div className="bg-fb-dark py-20"> {/* Match your "How It Works" bg */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-16">
          Trending <span style={{ color: '#FF48B9' }}>Now</span>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard 
              key={campaign.id} 
              campaign={campaign}
              // --- HERE IS THE BADGE LOGIC ---
              // Pass `is_featured` from the API to the card
              isFeatured={campaign.is_featured}
              // If it's NOT featured, but IS in this list, it's trending.
              isTrending={!campaign.is_featured}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
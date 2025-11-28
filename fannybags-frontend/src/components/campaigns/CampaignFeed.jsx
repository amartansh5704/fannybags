import { useState, useEffect } from 'react';
import { campaignService } from '../../services/campaignService';
import CampaignFeedCard from './CampaignFeedCard';

export default function CampaignFeed() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns();
        // Filter only live campaigns for the feed
        const liveCampaigns = data.filter(c => c.funding_status === 'live');
        setCampaigns(liveCampaigns);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading campaigns...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">No active campaigns at the moment</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Trending Campaigns</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignFeedCard 
            key={campaign.id} 
            campaign={campaign}
          />
        ))}
      </div>
    </div>
  );
}
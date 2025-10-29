import { useState, useEffect } from 'react';
import { campaignService } from '../../services/campaignService';
import CampaignCard from '../campaigns/CampaignCard';
import AnimatedList from '../reactbits/components/AnimatedList';

export default function TrendingSection() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getTrendingCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error('Failed to fetch trending campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-80 bg-white/5 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  return (
    <AnimatedList
      staggerDelay={0.1}
      className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
    >
      {campaigns.map((campaign) => (
        <div key={campaign.id}>
          <CampaignCard
            campaign={campaign}
            isFeatured={false}
            isTrending={true}
          />
        </div>
      ))}
    </AnimatedList>
  );
}
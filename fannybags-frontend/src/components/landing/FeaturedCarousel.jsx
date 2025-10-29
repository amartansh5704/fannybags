import { useState, useEffect } from 'react';
import CampaignCard from '../campaigns/CampaignCard';
import AnimatedList from '../reactbits/components/AnimatedList';
import FadeContent from '../reactbits/animations/FadeContent';
import { campaignService } from '../../services/campaignService';

export default function FeaturedCarousel() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        // Using trending as featured source (no separate "featured" endpoint yet)
        const data = await campaignService.getTrendingCampaigns();
        // Take first 3 for featured carousel
        setFeatured(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch featured campaigns:', err);
        setError('Could not load featured campaigns.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <div className="bg-fb-dark py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="h-8 w-1/3 bg-gray-700 rounded animate-pulse mx-auto mb-4" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || featured.length === 0) {
    return null;
  }

  return (
    <div className="bg-fb-surface py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeContent duration={1000} className="mb-12">
          <h2 className="text-4xl font-bold text-center">
            Editors' <span style={{ color: '#12CE6A' }}>Pick</span>
          </h2>
          <p className="text-gray-400 text-center mt-4">Hand-curated campaigns we think you'll love</p>
        </FadeContent>

        {/* Animated Carousel Grid */}
        <AnimatedList
          staggerDelay={0.15}
          className="grid md:grid-cols-3 gap-6"
        >
          {featured.map((campaign) => (
            <div key={campaign.id}>
              <CampaignCard
                campaign={campaign}
                isFeatured={true}
                isTrending={false}
              />
            </div>
          ))}
        </AnimatedList>
      </div>
    </div>
  );
}
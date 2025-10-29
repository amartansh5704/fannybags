import { useState, useEffect } from 'react';
import CampaignCard from '../campaigns/CampaignCard';
import AnimatedList from '../reactbits/components/AnimatedList';
import FadeContent from '../reactbits/animations/FadeContent';
import GlassCard from '../reactbits/components/GlassCard';
import { campaignService } from '../../services/campaignService';

export default function EditorsPickCarousel() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getTrendingCampaigns();
        // Take first 3 for editors' pick
        setFeatured(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch featured campaigns:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="h-10 w-1/3 bg-gray-700 rounded animate-pulse mx-auto mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!featured || featured.length === 0) {
    return null;
  }

  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient background accent */}
      <div className="absolute -left-40 top-40 w-80 h-80 bg-fb-pink/5 rounded-full blur-3xl -z-10" />
      <div className="absolute -right-40 bottom-40 w-80 h-80 bg-fb-green/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-6xl mx-auto">
        <FadeContent duration={1000} className="mb-16">
          <div className="text-center">
            <div className="inline-block px-4 py-2 bg-fb-pink/10 rounded-full border border-fb-pink/30 mb-4">
              <span className="text-fb-pink font-semibold text-sm">✨ CURATED</span>
            </div>
            <h2 className="text-5xl font-black mt-4">Editors' Pick</h2>
            <p className="text-gray-400 mt-4 text-lg">Hand-selected campaigns with highest potential</p>
          </div>
        </FadeContent>

        {/* Editors' Pick Grid - Smaller, more curated feel */}
        <AnimatedList
          staggerDelay={0.15}
          className="grid md:grid-cols-3 gap-6"
        >
          {featured.map((campaign) => (
            <div key={campaign.id} className="group">
              <div className="relative">
                {/* Glow background on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-fb-pink to-fb-green rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition duration-300 -z-10" />
                
                <CampaignCard
                  campaign={campaign}
                  isFeatured={true}
                  isTrending={false}
                />
              </div>
            </div>
          ))}
        </AnimatedList>

        {/* "See More" CTA */}
        <FadeContent duration={1000} delay={300} className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/campaigns'}
            className="px-8 py-3 bg-gradient-to-r from-fb-pink/20 to-fb-green/20 border border-fb-pink/40 text-white rounded-lg font-semibold hover:from-fb-pink/30 hover:to-fb-green/30 transition-all"
          >
            Explore All Campaigns →
          </button>
        </FadeContent>
      </div>
    </section>
  );
}
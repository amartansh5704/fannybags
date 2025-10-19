import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';

export default function CampaignBrowse() {
  const [campaigns, setCampaigns] = useState([]);
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

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns();
        setCampaigns(data);
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

        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-6">No campaigns available yet</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => {
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
                    <span className="text-fb-pink">View Details →</span>
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
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { useAuthStore } from '../store/authStore';
import InvestmentForm from '../components/campaigns/InvestmentForm';
import AIPredictor from '../components/campaigns/AIPredictor';
import InvestmentHistory from '../components/campaigns/InvestmentHistory';
import { IoShareSocial } from 'react-icons/io5'; // <-- ADDED
import ShareModal from '../components/common/ShareModal'; // <-- ADDED
import CommentSection from '../components/campaigns/CommentSection';


export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvest, setShowInvest] = useState(false);
  const [showShare, setShowShare] = useState(false); // <-- ADDED

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const [campaignData, analyticsData] = await Promise.all([
          campaignService.getCampaignById(id),
          campaignService.getAnalytics(id).catch(() => null) // Analytics might not exist for all campaigns
        ]);
        setCampaign(campaignData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError('Failed to load campaign');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  const handleBuy = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role === 'artist') {
      alert('Artists cannot buy partitions');
      return;
    }

    setShowInvest(true);
  };

  const handleInvestmentSuccess = async () => {
    // Refresh campaign data after successful investment
    try {
      const [campaignData, analyticsData] = await Promise.all([
        campaignService.getCampaignById(id),
        campaignService.getAnalytics(id).catch(() => null)
      ]);
      setCampaign(campaignData);
      setAnalytics(analyticsData);
      setShowInvest(false);
      alert('Investment successful!');
    } catch (err) {
      console.error('Error refreshing campaign data:', err);
      setShowInvest(false);
      alert('Investment successful, but failed to refresh data');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <p>Loading campaign...</p>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-6">{error || 'Campaign not found'}</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  // Calculate campaign status and availability
  const now = new Date();
  const startDate = campaign.start_date ? new Date(campaign.start_date) : null;
  const endDate = campaign.end_date ? new Date(campaign.end_date) : null;
  
  const isUpcoming = startDate && startDate > now;
  const isEnded = endDate && endDate < now;
  const isLiveWindow = !isUpcoming && !isEnded;
  const isPublishedLive = campaign.funding_status === 'live';
  const isActive = isPublishedLive && isLiveWindow;

  // Calculate available partitions
  const partitionsSold = analytics?.partitions_sold || 0;
  const totalPartitions = campaign.total_partitions || 0;
  const availablePartitions = Math.max(0, totalPartitions - partitionsSold);
  const minPartitions = campaign.min_partitions_per_user || 1;

  // Determine button text and state
  const getButtonText = () => {
    if (!isAuthenticated) return 'Login to Invest';
    if (user?.role === 'artist') return 'Artists Cannot Invest';
    if (!isActive) {
      if (isUpcoming) return 'Starts Soon';
      if (isEnded) return 'Ended';
      return 'Not Available';
    }
    if (availablePartitions <= 0) return 'Sold Out';
    return 'Invest Now';
  };

  const isButtonDisabled = () => {
    if (!isAuthenticated) return false; // Allow login redirect
    if (user?.role === 'artist') return true;
    if (!isActive) return true;
    if (availablePartitions <= 0) return true;
    return false;
  };

  const shareUrl = window.location.href; // <-- ADDED

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/campaigns')}
          className="text-fb-pink hover:underline mb-6"
        >
          ← Back to Campaigns
        </button>

        {/* Campaign Header */}
        <div className="mb-10">
          {/* 🔥 UPDATED: Artwork & Audio Section */}
          <div className="w-full h-64 bg-gradient-to-r from-fb-purple to-fb-pink rounded-lg flex items-center justify-center mb-6 overflow-hidden relative">
            {campaign.artwork_url ? (
              <img 
                src={`${import.meta.env.VITE_BACKEND_URL|| 'http://127.0.0.1:5000'}${campaign.artwork_url}`}
                alt={campaign.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
            ) : null}
            <span className={`text-6xl ${campaign.artwork_url ? 'hidden' : ''}`}>🎵</span>
            
            {/* Audio Player */}
            {campaign.audio_preview_url && (
              <div className="absolute bottom-4 left-4 right-4">
                <audio 
                  controls 
                  className="w-full"
                  src={`${import.meta.env.VITE_BACKEND_URL|| 'http://127.0.0.1:5000'}${campaign.audio_preview_url}`}
                >
                  Your browser does not support audio.
                </audio>
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-2">{campaign.title}</h1>
          <p className="text-gray-400 mb-6">{campaign.description}</p>

          {/* Artist Profile Link */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/artist/${campaign.artist_id}`)}
              className="text-fb-pink hover:text-white font-semibold flex items-center gap-2"
            >
              👤 View Artist Profile
            </button>
            
            {/* --- ADDED THIS BUTTON --- */}
            <button
              onClick={() => setShowShare(true)}
              className="text-gray-300 hover:text-white font-semibold flex items-center gap-2"
            >
              <IoShareSocial /> Share Campaign
            </button>
            {/* --- END OF ADDITION --- */}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-fb-surface p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm mb-2">Funding Progress</h3>
              <div className="flex justify-between mb-2">
                <span className="text-2xl font-bold">₹{campaign.amount_raised.toLocaleString()}</span>
                <span className="text-gray-400">of ₹{campaign.target_amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
                <div
                  className="bg-fb-green h-3 rounded-full"
                  style={{
                    width: `${(campaign.amount_raised / campaign.target_amount) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                {((campaign.amount_raised / campaign.target_amount) * 100).toFixed(0)}% funded
              </p>
            </div>

            <div className="bg-fb-surface p-6 rounded-lg">
              <h3 className="text-gray-400 text-sm mb-2">Campaign Info</h3>
              <p className="mb-2">
                Revenue Share: <span className="text-fb-pink font-bold">{campaign.revenue_share_pct}%</span>
              </p>
              <p className="mb-2">
                Partition Price: <span className="text-fb-green font-bold">₹{campaign.partition_price}</span>
              </p>
              <p className="mb-2">
                Total Partitions: <span className="font-bold">{campaign.total_partitions}</span>
              </p>
              <p className="mb-2">
                Available: <span className="font-bold text-fb-green">{availablePartitions}</span>
              </p>
              <p className="text-sm text-gray-400 mt-3">
                Status: <span className="capitalize text-fb-pink">
                  {isUpcoming ? 'Upcoming' : isEnded ? 'Ended' : campaign.funding_status}
                </span>
              </p>
            </div>
          </div>

          {campaign.expected_streams_3m && (
            <div className="bg-fb-surface p-6 rounded-lg mb-10">
              <h3 className="text-gray-400 text-sm mb-2">Expected Revenue (3 months)</h3>
              <p className="text-2xl font-bold">₹{campaign.expected_revenue_3m?.toLocaleString() || 'N/A'}</p>
              <p className="text-sm text-gray-400 mt-2">Expected Streams: {campaign.expected_streams_3m?.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Investment Section */}
        <div className="bg-fb-surface p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Invest in This Campaign</h2>
          
          <div className="bg-fb-dark p-4 rounded mb-6">
            <h4 className="font-semibold mb-2 text-fb-green">Investment Details</h4>
            <p className="text-sm mb-2">Minimum partitions: {minPartitions}</p>
            <p className="text-sm mb-2">Available partitions: {availablePartitions}</p>
            <p className="text-sm">Price per partition: ₹{campaign.partition_price}</p>
          </div>

          {isAuthenticated ? (
            <button
              onClick={handleBuy}
              disabled={isButtonDisabled()}
              className="w-full py-3 bg-fb-pink text-white rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {getButtonText()}
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-fb-pink text-white rounded font-semibold hover:opacity-90 transition"
            >
              Login to Invest
            </button>
          )}
        </div>

        {/* Investment Modal */}
        {showInvest && campaign && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
              <InvestmentForm
                campaignId={Number(id)}
                partitionPrice={campaign.partition_price}
                minPartitions={minPartitions}
                availablePartitions={availablePartitions}
                onClose={() => setShowInvest(false)}
                onSuccess={handleInvestmentSuccess}
              />
            </div>
          </div>
        )}
        {/* Investment History */}
        <div className="mt-10">
          <InvestmentHistory campaignId={Number(id)} />
        </div>


        {/* AI Revenue Predictor */}
        <div className="mt-10">
          <AIPredictor revenueSharePct={campaign?.revenue_share_pct || 40} />
        </div>

        {/* --- ADDED THIS MODAL --- */}
        {showShare && (
          <ShareModal
            title={campaign.title}
            url={shareUrl}
            onClose={() => setShowShare(false)}
          />
        )}
        {/* --- END OF ADDITION --- */}
        {/* Comments Section */}
        <div className="mt-12">
        <CommentSection campaignId={campaign.id} />
      </div>
              
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { useAuthStore } from '../store/authStore';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [partitionsCount, setPartitionsCount] = useState(1);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getCampaignById(id);
        setCampaign(data);
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

    setBuying(true);
    try {
      await campaignService.buyCampaign(id, partitionsCount);
      alert('Purchase successful!');
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Purchase failed');
    } finally {
      setBuying(false);
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

  const totalCost = partitionsCount * campaign.partition_price;
  const yourOwnership = (partitionsCount / campaign.total_partitions) * campaign.revenue_share_pct;

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
          <div className="w-full h-64 bg-gradient-to-r from-fb-purple to-fb-pink rounded-lg flex items-center justify-center mb-6">
            <span className="text-6xl">🎵</span>
          </div>

          <h1 className="text-4xl font-bold mb-2">{campaign.title}</h1>
          <p className="text-gray-400 mb-6">{campaign.description}</p>

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
              <p className="text-sm text-gray-400 mt-3">
                Status: <span className="capitalize text-fb-pink">{campaign.funding_status}</span>
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

        {/* Buy Section */}
        {campaign.funding_status === 'live' && (
          <div className="bg-fb-surface p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Invest in This Campaign</h2>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Number of Partitions</label>
              <input
                type="number"
                min="1"
                max={campaign.total_partitions}
                value={partitionsCount}
                onChange={(e) => setPartitionsCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 bg-fb-dark text-white border border-gray-600 rounded focus:outline-none focus:border-fb-pink"
              />
            </div>

            <div className="bg-fb-dark p-4 rounded mb-6">
              <div className="flex justify-between mb-2">
                <span>Cost per partition:</span>
                <span>₹{campaign.partition_price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Number of partitions:</span>
                <span>{partitionsCount}</span>
              </div>
              <div className="border-t border-gray-600 pt-2 flex justify-between font-bold">
                <span>Total Cost:</span>
                <span className="text-fb-pink">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-fb-dark p-4 rounded mb-6 border border-fb-green">
              <h4 className="font-semibold mb-2 text-fb-green">Your Investment Returns</h4>
              <p className="text-sm mb-2">If you invest ₹{totalCost.toLocaleString()}:</p>
              <p className="text-sm">
                Your Ownership: <span className="font-bold text-fb-pink">{yourOwnership.toFixed(2)}%</span> of investor pool
              </p>
              {campaign.expected_revenue_3m && (
                <p className="text-sm mt-2">
                  Expected Return (3m): <span className="font-bold text-fb-green">
                    ₹{((yourOwnership / 100) * campaign.expected_revenue_3m).toFixed(0)}
                  </span>
                </p>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={handleBuy}
                disabled={buying || campaign.funding_status !== 'live'}
                className="w-full py-3 bg-fb-pink text-white rounded font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                {buying ? 'Processing...' : `Buy ${partitionsCount} Partition${partitionsCount > 1 ? 's' : ''}`}
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
        )}

        {campaign.funding_status !== 'live' && (
          <div className="bg-fb-surface p-8 rounded-lg text-center">
            <p className="text-gray-400">
              This campaign is <span className="capitalize text-fb-pink font-bold">{campaign.funding_status}</span> and not accepting investments right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
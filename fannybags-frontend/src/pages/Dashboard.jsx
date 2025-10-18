import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../services/investorService';
import { campaignService } from '../services/campaignService';
import HoldingsCard from '../components/investor/HoldingsCard';
import PortfolioSummary from '../components/investor/PortfolioSummary';
import EarningsCard from '../components/investor/EarningsCard';
import PayoutHistory from '../components/investor/PayoutHistory';
import CreateCampaignForm from '../components/artist/CreateCampaignForm';
import CampaignStats from '../components/artist/CampaignStats';
import RevenueUpload from '../components/artist/RevenueUpload';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [holdings, setHoldings] = useState([]);
  const [totalExpected, setTotalExpected] = useState(0);
  const [campaigns, setCampaigns] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRole(user?.role || '');
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'investor') return;
    const fetchData = async () => {
      try {
        const returnsData = await investorService.getExpectedReturns(user.id);
        setHoldings(returnsData.holdings_breakdown || []);
        setTotalExpected(returnsData.total_expected_return_3m || 0);
        
        const txData = await investorService.getTransactions(user.id);
        setTransactions(txData || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [isAuthenticated, user?.id, user?.role]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'artist') return;
    const loadCampaigns = async () => {
      try {
        const artistCampaigns = await campaignService.getMyArtistCampaigns();
        setCampaigns(artistCampaigns);
      } catch (err) {
        console.error(err);
      }
    };
    loadCampaigns();
  }, [isAuthenticated, user?.role]);

  const refreshCampaigns = async () => {
    try {
      const artistCampaigns = await campaignService.getMyArtistCampaigns();
      setCampaigns(artistCampaigns);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-2">
          Welcome to your <span style={{ color: '#FF48B9' }}>Dashboard</span>
        </h1>
        <p className="text-gray-400 mb-10 capitalize">Role: {role}</p>

        <div className="bg-fb-surface p-6 rounded-lg mb-10">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <p className="text-gray-400">User ID: <span className="text-white font-bold">{user?.id}</span></p>
        </div>

        {role === 'investor' && (
          <div className="mb-10">
            <h2 className="text-2xl font-bold mb-6">Your Portfolio & Earnings</h2>
            {holdings.length === 0 ? (
              <div className="bg-fb-surface p-8 rounded-lg text-center">
                <p className="text-gray-400 mb-6">No investments yet</p>
                <button onClick={() => navigate('/campaigns')} className="px-6 py-2 bg-fb-green text-white rounded hover:opacity-90">
                  Explore Campaigns
                </button>
              </div>
            ) : (
              <>
                <PortfolioSummary holdings={holdings} totalExpected={totalExpected} />
                
                <h3 className="text-xl font-bold mb-6 mt-10">Your Earnings</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {holdings.map((holding) => (
                    <EarningsCard key={holding.holding_id} holding={holding} />
                  ))}
                </div>

                <h3 className="text-xl font-bold mb-6">Your Investments</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {holdings.map((holding) => (
                    <HoldingsCard key={holding.holding_id} holding={holding} />
                  ))}
                </div>

                <PayoutHistory transactions={transactions} />
              </>
            )}
          </div>
        )}

        {role === 'artist' && (
          <div className="mb-10">
            {showCreateForm ? (
              <>
                <button onClick={() => { setShowCreateForm(false); refreshCampaigns(); }} className="mb-6 text-fb-pink hover:underline">
                  ← Back
                </button>
                <CreateCampaignForm onSuccess={() => { setShowCreateForm(false); refreshCampaigns(); }} />
              </>
            ) : (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Your Campaigns</h2>
                  <button onClick={() => setShowCreateForm(true)} className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90">
                    + Create
                  </button>
                </div>

                {campaigns.length === 0 ? (
                  <div className="bg-fb-surface p-8 rounded-lg text-center">
                    <p className="text-gray-400 mb-6">No campaigns yet</p>
                    <button onClick={() => setShowCreateForm(true)} className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90">
                      Create Campaign
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-6">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id}>
                        <CampaignStats campaign={campaign} />
                        <RevenueUpload
                          campaignId={campaign.id}
                          campaignTitle={campaign.title}
                          campaignStatus={campaign.funding_status}
                          onStatusChange={refreshCampaigns}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
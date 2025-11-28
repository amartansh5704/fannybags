import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../services/investorService';
import { campaignService } from '../services/campaignService';
import HoldingsCard from '../components/investor/HoldingsCard';
import PortfolioSummary from '../components/investor/PortfolioSummary';
import EarningsCard from '../components/investor/EarningsCard';
import PayoutHistory from '../components/investor/PayoutHistory';
import WalletDashboard from '../components/investor/WalletDashboard';
import CreateCampaignForm from '../components/artist/CreateCampaignForm';
import CampaignStats from '../components/artist/CampaignStats';
import RevenueUpload from '../components/artist/RevenueUpload';
import CampaignMetrics from '../components/artist/CampaignMetrics';
import ProgressChart from '../components/artist/ProgressChart';
import RevenueChart from '../components/artist/RevenueChart';
import CampaignWizard from '../components/artist/CampaignWizard';
import { showToast } from '../utils/animations'; // 🔥 ADDED
import GlassCard from '../components/reactbits/components/GlassCard';
import FadeContent from '../components/reactbits/animations/FadeContent';
import PortfolioBento from '../components/investor/PortfolioBento';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [holdings, setHoldings] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [portfolioData, setPortfolioData] = useState(null);
  const [walletData, setWalletData] = useState(null);

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
        console.log('Dashboard: Fetching complete portfolio for user:', user.id);
        
        const portfolioResponse = await investorService.getPortfolio(user.id);
        console.log('Complete portfolio response:', portfolioResponse);
        
        setWalletData(portfolioResponse.wallet || {
          balance: 0,
          total_deposited: 0,
          total_invested: 0,
          total_earnings: 0
        });
        
        setPortfolioData(portfolioResponse.portfolio || {
          total_invested: 0,
          total_earnings: 0,
          overall_roi: 0,
          number_of_campaigns: 0,
          expected_returns_3m: 0
        });
        
        setHoldings(portfolioResponse.holdings || []);
        setTransactions(portfolioResponse.recent_transactions || []);
        
        console.log('Dashboard: All portfolio data loaded successfully');
      } catch (err) {
        console.error('Dashboard: Error fetching portfolio:', err);
        // 🔥 ADDED: Show error toast
        showToast.error('Failed to load portfolio data');
        
        setWalletData({
          balance: 0,
          total_deposited: 0,
          total_invested: 0,
          total_earnings: 0
        });
        setPortfolioData({
          total_invested: 0,
          total_earnings: 0,
          overall_roi: 0,
          number_of_campaigns: 0,
          expected_returns_3m: 0
        });
        setHoldings([]);
        setTransactions([]);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user?.id, user?.role]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'artist') return;
    const loadCampaigns = async () => {
      try {
        const artistCampaigns = await campaignService.getMyArtistCampaigns();
        
        const campaignsWithRevenue = await Promise.all(
          artistCampaigns.map(async (campaign) => {
            try {
              const revenueData = await campaignService.getCampaignActualRevenue(campaign.id);
              return {
                ...campaign,
                actual_revenue: revenueData.actual_revenue
              };
            } catch (err) {
              console.error(`Error fetching revenue for campaign ${campaign.id}:`, err);
              return {
                ...campaign,
                actual_revenue: 0
              };
            }
          })
        );
        
        setCampaigns(campaignsWithRevenue);
      } catch (err) {
        console.error(err);
        // 🔥 ADDED: Show error toast
        showToast.error('Failed to load campaigns');
      }
    };
    loadCampaigns();
  }, [isAuthenticated, user?.role]);

  const refreshCampaigns = async () => {
    try {
      const artistCampaigns = await campaignService.getMyArtistCampaigns();
      
      const campaignsWithRevenue = await Promise.all(
        artistCampaigns.map(async (campaign) => {
          try {
            const revenueData = await campaignService.getCampaignActualRevenue(campaign.id);
            return {
              ...campaign,
              actual_revenue: revenueData.actual_revenue
            };
          } catch (err) {
            console.error(`Error fetching revenue for campaign ${campaign.id}:`, err);
            return {
              ...campaign,
              actual_revenue: 0
            };
          }
        })
      );
      
      setCampaigns(campaignsWithRevenue);
    } catch (err) {
      console.error(err);
      // 🔥 ADDED: Show error toast
      showToast.error('Failed to refresh campaigns');
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
            <div className="flex gap-4 mb-6 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'overview'
                    ? 'text-fb-pink border-b-2 border-fb-pink'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Portfolio Overview
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-6 py-3 font-semibold transition-all ${
                  activeTab === 'wallet'
                    ? 'text-fb-pink border-b-2 border-fb-pink'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Wallet
              </button>
            </div>

            {activeTab === 'overview' && (
              <>
                <h2 className="text-2xl font-bold mb-6">Your Portfolio & Earnings</h2>
                 {/* 🔥 NEW: Magic Bento Grid */}
    {holdings.length > 0 && (
      <div className="mb-10">
        <PortfolioBento 
          portfolio={portfolioData} 
          holdings={holdings}
          walletData={walletData}
        />
      </div>
    )}
                {holdings.length === 0 ? (
                  <div className="bg-fb-surface p-8 rounded-lg text-center">
                    <p className="text-gray-400 mb-6">No investments yet</p>
                    <button onClick={() => navigate('/campaigns')} className="px-6 py-2 bg-fb-green text-white rounded hover:opacity-90">
                      Explore Campaigns
                    </button>
                  </div>
                ) : (
                  <>
                    <PortfolioSummary portfolio={portfolioData} wallet={walletData} />
                    
                    <h3 className="text-xl font-bold mb-6 mt-10">Your Earnings</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                      {holdings.map((holding) => {
                        const campaignEarnings = transactions
                          .filter(t => t.transaction_type === 'revenue_share' || t.transaction_type === 'earning')
                          .filter(t => t.description && t.description.includes(holding.campaign_title))
                          .reduce((sum, t) => sum + t.amount, 0);
                        
                        console.log(`Campaign "${holding.campaign_title}" earnings:`, campaignEarnings);
                        
                        return (
                          <EarningsCard 
                            key={holding.holding_id}
                            holding={holding}
                            actualEarnings={holding.actual_earnings || campaignEarnings}
                          />
                        );
                      })}
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
              </>
            )}

            {activeTab === 'wallet' && (
              <WalletDashboard />
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
                <CampaignWizard onSuccess={() => { setShowCreateForm(false); refreshCampaigns(); }} />
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
                  <>
                    <div className="mb-8">
                      <h3 className="text-xl font-bold mb-6">Campaign Analytics Dashboard</h3>
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="mb-8">
                          <h4 className="text-lg font-semibold mb-4 text-fb-pink">{campaign.title}</h4>
                          <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            <CampaignMetrics campaign={campaign} />
                            <ProgressChart campaign={campaign} />
                            <RevenueChart campaign={campaign} />
                          </div>
                        </div>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold mb-6">🎛️ Campaign Management</h3>
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
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
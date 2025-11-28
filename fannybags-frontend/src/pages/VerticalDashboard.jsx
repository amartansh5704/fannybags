import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../services/investorService';
import { campaignService } from '../services/campaignService';
import HoldingsCard from '../components/investor/HoldingsCard';
import EarningsCard from '../components/investor/EarningsCard';
import PayoutHistory from '../components/investor/PayoutHistory';
import WalletDashboard from '../components/investor/WalletDashboard';
import CampaignStats from '../components/artist/CampaignStats';
import RevenueUpload from '../components/artist/RevenueUpload';
import CampaignMetrics from '../components/artist/CampaignMetrics';
import ProgressChart from '../components/artist/ProgressChart';
import RevenueChart from '../components/artist/RevenueChart';
import CampaignWizard from '../components/artist/CampaignWizard';
import { showToast } from '../utils/animations';
import PortfolioBento from '../components/investor/PortfolioBento';
import CampaignFeed from '../components/campaigns/CampaignFeed';

export default function VerticalDashboard() {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setRole(user?.role || '');
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'investor') {
      setLoading(false);
      return;
    }
    
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
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated, user?.id, user?.role]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'artist') {
      setLoading(false);
      return;
    }
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
        showToast.error('Failed to load campaigns');
      } finally {
        setLoading(false);
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
      showToast.error('Failed to refresh campaigns');
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[#05030A]">
        <div></div>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-20 w-20 border-b-2 border-[#FF48B9] mx-auto mb-6"
              style={{ boxShadow: '0 0 30px rgba(255,72,185,0.8)' }}
            ></div>
            <p className="text-gray-400 text-sm tracking-wide uppercase font-semibold">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[#05030A] text-white">
      {/* SIDEBAR PLACEHOLDER (240px) */}
      <div></div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 px-4 py-8 flex flex-col items-center min-h-screen">
        
        {/* CENTERED CONTENT WRAPPER */}
        <div className="w-full max-w-7xl">
          
          {/* 🎯 PREMIUM HEADER SECTION */}
          <div className="mb-8 text-center space-y-4">
            {/* Welcome Title */}
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-2 tracking-tight leading-tight">
                Welcome to your{' '}
                <span 
                  className="relative inline-block"
                  style={{ 
                    color: '#FF48B9',
                    textShadow: '0 0 40px rgba(255,72,185,0.6)'
                  }}
                >
                  Dashboard
                </span>
              </h1>
              <p className="text-gray-400 text-lg font-medium tracking-wide">
                <span className="capitalize text-[#FF48B9]">{role}</span> · Manage your portfolio with confidence
              </p>
            </div>

            {/* Account Information Card */}
            <div 
              className="inline-block px-6 py-3 rounded-2xl"
              style={{
                background: 'radial-gradient(circle at 50% 0%, rgba(255,72,185,0.12) 0%, transparent 70%), linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.95))',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(255,72,185,0.25)',
                boxShadow: '0 20px 40px rgba(255,72,185,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
              }}
            >
              <div className="flex items-center gap-3 justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm font-medium">User ID:</span>
                  <span className="text-white font-bold text-sm tracking-wider">{user?.id}</span>
                </div>
                <div 
                  className="h-6 w-px"
                  style={{ background: 'linear-gradient(to bottom, transparent, rgba(255,72,185,0.3), transparent)' }}
                ></div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ 
                      background: '#12CE6A',
                      boxShadow: '0 0 10px rgba(18,206,106,0.8)'
                    }}
                  ></div>
                  <span className="text-gray-400 text-sm font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* INVESTOR VIEW */}
          {role === 'investor' && (
            <div className="space-y-6">
              
              {/* 🎯 TAB NAVIGATION - Centered */}
              <div className="flex justify-center">
                <div className="inline-flex gap-2 p-1.5 rounded-2xl" style={{
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.5), rgba(2,6,23,0.7))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
                }}>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === 'overview'
                        ? 'text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={activeTab === 'overview' ? {
                      background: 'linear-gradient(135deg, rgba(255,72,185,0.9), rgba(139,92,246,0.8))',
                      boxShadow: '0 4px 20px rgba(255,72,185,0.5)'
                    } : {}}
                  >
                    📊 Portfolio Overview
                  </button>
                  <button
                    onClick={() => setActiveTab('wallet')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === 'wallet'
                        ? 'text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={activeTab === 'wallet' ? {
                      background: 'linear-gradient(135deg, rgba(255,72,185,0.9), rgba(139,92,246,0.8))',
                      boxShadow: '0 4px 20px rgba(255,72,185,0.5)'
                    } : {}}
                  >
                    💰 Wallet
                  </button>
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      activeTab === 'explore'
                        ? 'text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    style={activeTab === 'explore' ? {
                      background: 'linear-gradient(135deg, rgba(255,72,185,0.9), rgba(139,92,246,0.8))',
                      boxShadow: '0 4px 20px rgba(255,72,185,0.5)'
                    } : {}}
                  >
                    🎵 Explore Campaigns
                  </button>
                </div>
              </div>

              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="text-center mb-3">
                    <h2 className="text-3xl font-bold mb-2">Your Portfolio & Earnings</h2>
                    <p className="text-gray-400">Track your investments and returns in real-time</p>
                  </div>

                  {holdings.length === 0 ? (
                    <div className="flex justify-center">
                      <div
                        className="p-12 rounded-3xl text-center max-w-2xl w-full"
                        style={{
                          background: 'radial-gradient(circle at 50% 0%, rgba(148,163,184,0.1) 0%, transparent 70%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(148,163,184,0.25)',
                          boxShadow: '0 24px 48px rgba(15,23,42,0.9)'
                        }}
                      >
                        <div className="mb-6">
                          <div className="text-6xl mb-4">📊</div>
                          <p className="text-gray-400 text-lg mb-2">No investments yet</p>
                          <p className="text-gray-500 text-sm">Start building your music portfolio today</p>
                        </div>
                        <button
                          onClick={() => setActiveTab('explore')}
                          className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105"
                          style={{
                            background: 'linear-gradient(90deg, #12CE6A 0%, #22C55E 100%)',
                            boxShadow: '0 8px 24px rgba(34,197,94,0.4)'
                          }}
                        >
                          Explore Campaigns
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 🎯 CENTERED BENTO GRID */}
                      <div className="mb-6">
                        <div className="mx-auto">
                          <PortfolioBento 
                            portfolio={portfolioData} 
                            holdings={holdings}
                            walletData={walletData}
                          />
                        </div>
                      </div>
                      
                      {/* Earnings Section */}
                      <div>
                        <h3 className="text-2xl font-bold mb-4 text-center">Your Earnings</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {holdings.map((holding) => {
                            const campaignEarnings = transactions
                              .filter(t => t.transaction_type === 'revenue_share' || t.transaction_type === 'earning')
                              .filter(t => t.description && t.description.includes(holding.campaign_title))
                              .reduce((sum, t) => sum + t.amount, 0);
                            
                            return (
                              <EarningsCard 
                                key={holding.holding_id}
                                holding={holding}
                                actualEarnings={holding.actual_earnings || campaignEarnings}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Holdings Section */}
                      <div>
                        <h3 className="text-2xl font-bold mb-4 text-center">Your Investments</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {holdings.map((holding) => (
                            <HoldingsCard key={holding.holding_id} holding={holding} />
                          ))}
                        </div>
                      </div>

                      {/* Payout History */}
                      <PayoutHistory transactions={transactions} />
                    </>
                  )}
                </div>
              )}

              {/* WALLET TAB */}
              {activeTab === 'wallet' && (
                <div>
                  <WalletDashboard />
                </div>
              )}

              {/* EXPLORE TAB */}
              {activeTab === 'explore' && (
                <div>
                  <CampaignFeed />
                </div>
              )}
            </div>
          )}

          {/* ARTIST VIEW */}
          {role === 'artist' && (
            <div className="space-y-6">
              {showCreateForm ? (
                <>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      refreshCampaigns();
                    }}
                    className="mb-8 text-[#FF48B9] hover:underline flex items-center gap-2 text-lg font-semibold transition-all hover:gap-3"
                  >
                    ← Back to Campaigns
                  </button>
                  <CampaignWizard
                    onSuccess={() => {
                      setShowCreateForm(false);
                      refreshCampaigns();
                    }}
                  />
                </>
              ) : (
                <>
                  {/* Header with Create Button */}
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">Your Campaigns</h2>
                      <p className="text-gray-400">Manage and track your music campaigns</p>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105"
                      style={{
                        background: 'linear-gradient(90deg, #FF48B9 0%, #8B5CF6 100%)',
                        boxShadow: '0 8px 24px rgba(255,72,185,0.4)'
                      }}
                    >
                      + Create Campaign
                    </button>
                  </div>

                  {campaigns.length === 0 ? (
                    <div className="flex justify-center">
                      <div
                        className="p-12 rounded-3xl text-center max-w-2xl w-full"
                        style={{
                          background: 'radial-gradient(circle at 50% 0%, rgba(255,72,185,0.12) 0%, transparent 70%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))',
                          backdropFilter: 'blur(30px)',
                          border: '1px solid rgba(255,72,185,0.25)',
                          boxShadow: '0 24px 48px rgba(255,72,185,0.2)'
                        }}
                      >
                        <div className="mb-6">
                          <div className="text-6xl mb-4">🎵</div>
                          <p className="text-gray-400 text-lg mb-2">No campaigns yet</p>
                          <p className="text-gray-500 text-sm">Launch your first campaign and start raising funds</p>
                        </div>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="px-8 py-4 rounded-xl font-semibold transition-all hover:opacity-90 hover:scale-105"
                          style={{
                            background: 'linear-gradient(90deg, #FF48B9 0%, #8B5CF6 100%)',
                            boxShadow: '0 8px 24px rgba(255,72,185,0.4)'
                          }}
                        >
                          Create Your First Campaign
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Campaign Analytics Dashboard */}
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <h3 className="text-2xl font-bold mb-2">📊 Campaign Analytics Dashboard</h3>
                          <p className="text-gray-400">Real-time performance metrics for your campaigns</p>
                        </div>
                        {campaigns.map((campaign) => (
                          <div
                            key={campaign.id}
                            className="p-6 rounded-3xl space-y-4"
                            style={{
                              background: 'radial-gradient(circle at 0% 0%, rgba(139,92,246,0.12) 0%, transparent 60%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))',
                              backdropFilter: 'blur(30px)',
                              border: '1px solid rgba(139,92,246,0.25)',
                              boxShadow: '0 24px 48px rgba(139,92,246,0.2)'
                            }}
                          >
                            <h4 className="text-xl font-semibold" style={{ color: '#FF48B9' }}>
                              {campaign.title}
                            </h4>
                            <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                              <CampaignMetrics campaign={campaign} />
                              <ProgressChart campaign={campaign} />
                              <RevenueChart campaign={campaign} />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Campaign Management */}
                      <div className="space-y-4">
                        <div className="text-center mb-3">
                          <h3 className="text-2xl font-bold mb-2">🎛️ Campaign Management</h3>
                          <p className="text-gray-400">Update revenue and manage campaign status</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          {campaigns.map((campaign) => (
                            <div
                              key={campaign.id}
                              className="space-y-6"
                            >
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
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
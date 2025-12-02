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

  /*
   * HOW TO SHIFT BENTO GRID TO THE RIGHT:
   * 
   * Option 1: Using transform (recommended for fine-tuning)
   * style={{ transform: 'translateX(20px)' }}  // Shift 20px right
   * style={{ transform: 'translateX(5%)' }}    // Shift 5% right
   * 
   * Option 2: Using margin-left
   * className="ml-4"     // Shift 16px right
   * className="ml-[20px]" // Shift 20px right
   * className="ml-[5%]"   // Shift 5% right
   * 
   * Option 3: Using padding-left (increases left space only)
   * className="pl-4"     // Add 16px left padding
   * className="pl-[20px]" // Add 20px left padding
   * 
   * Option 4: Asymmetric padding
   * className="pl-[10%] pr-[5%]" // More left padding, less right
   */

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[#05030A] text-white">
      {/* SIDEBAR PLACEHOLDER (240px) */}
      <div></div>

      {/* MAIN CONTENT AREA - Full width usage with scroll */}
      <div className="relative z-10 min-h-screen w-full overflow-y-auto">
        
        {/* INVESTOR VIEW */}
        {role === 'investor' && (
          <div className="w-full">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="w-full">
                {holdings.length === 0 ? (
                  <div className="min-h-screen flex items-center justify-center px-[5%]">
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
                    {/* BENTO GRID - Centered with equal left/right space */}
                    <div className="min-h-screen flex items-center justify-center py-6 px-[5%] relative">
                      {/* 
                        To shift bento grid to the right, add one of these to the div below:
                        - style={{ transform: 'translateX(20px)' }} for 20px right
                        - style={{ transform: 'translateX(5%)' }} for 5% right
                        - className="ml-[20px]" for 20px right margin
                      */}
                      <div className="w-full max-w-[1600px] mx-auto" style={{ transform: 'translateX(100px) translateY(-15px) scale(1.1)' }}>
                        <PortfolioBento 
                          portfolio={portfolioData} 
                          holdings={holdings}
                          walletData={walletData}
                        />
                      </div>
                      
                      {/* SCROLL DOWN INDICATOR */}
                      
                    </div>
                    
                    {/* Earnings Section - Same padding as Bento for alignment */}
                    <div className="w-full py-12 px-[5%]">
                      <div className="max-w-[1600px] mx-auto">
                        <h3 className="text-3xl font-bold mb-6">Your Earnings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
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
                    </div>

                    {/* Holdings Section - Same padding as Bento for alignment */}
                    <div className="w-full py-12 px-[5%]">
                      <div className="max-w-[1600px] mx-auto">
                        <h3 className="text-3xl font-bold mb-6">Your Investments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
                          {holdings.map((holding) => (
                            <HoldingsCard key={holding.holding_id} holding={holding} />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Payout History - Same padding as Bento for alignment */}
                    <div className="w-full py-12 px-[5%]">
                      <div className="max-w-[1600px] mx-auto">
                        <PayoutHistory transactions={transactions} />
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* WALLET TAB */}
            {activeTab === 'wallet' && (
              <div className="w-full min-h-screen py-6 px-[5%]">
                <div className="max-w-[1600px] mx-auto">
                  <WalletDashboard />
                </div>
              </div>
            )}

            {/* EXPLORE TAB */}
            {activeTab === 'explore' && (
              <div className="w-full min-h-screen py-6 px-[5%]">
                <div className="max-w-[1600px] mx-auto">
                  <CampaignFeed />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ARTIST VIEW */}
        {role === 'artist' && (
          <div className="w-full min-h-screen bg-gradient-to-b from-black via-slate-950 to-black py-8 px-[5%]">
            <div className="max-w-[1600px] mx-auto">
              {showCreateForm ? (
                <>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      refreshCampaigns();
                    }}
                    className="
                      mb-8 text-[#FF48B9] hover:text-[#12CE6A] 
                      flex items-center gap-2 text-lg font-semibold 
                      transition-all hover:gap-4 group
                      bg-white/5 hover:bg-white/10
                      px-4 py-2 rounded-lg
                    "
                  >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    Back to Campaigns
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
                  {/* Header Section */}
                  <div className="mb-16">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-1 h-10 bg-gradient-to-b from-[#FF48B9] to-[#12CE6A] rounded-full" />
                          <h2 className="text-5xl md:text-6xl font-black text-white">Your Campaigns</h2>
                        </div>
                        <p className="text-gray-400 text-lg ml-4">Control your music fundraising journey</p>
                      </div>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="
                          px-8 py-4 rounded-2xl font-bold 
                          bg-white text-black
                          shadow-[0_0_30px_rgba(255,255,255,0.2)]
                          hover:shadow-[0_0_50px_rgba(255,255,255,0.3)]
                          hover:scale-105
                          active:scale-95
                          transition-all duration-200
                          text-base md:text-lg
                          w-full md:w-auto
                        "
                      >
                        + New Campaign
                      </button>
                    </div>
                  </div>
                  

                  {campaigns.length === 0 ? (
                    <div className="flex items-center justify-center min-h-[60vh]">
                      <div
                        className="
                          p-16 rounded-3xl text-center max-w-3xl w-full
                          border-2 border-dashed border-gray-700
                          bg-gradient-to-b from-slate-900/30 to-transparent
                          hover:border-gray-600
                          transition-all duration-300
                        "
                      >
                        <div className="mb-8">
                          <div className="text-8xl mb-6 inline-block animate-pulse">🎬</div>
                          <h3 className="text-3xl font-bold text-white mb-3">Ready to launch?</h3>
                          <p className="text-gray-300 text-lg mb-2">Create your first music campaign and connect with investors</p>
                          <p className="text-gray-500 text-sm">We'll help you reach your funding goals</p>
                        </div>
                        <button
                          onClick={() => setShowCreateForm(true)}
                          className="
                            px-8 py-4 rounded-2xl font-bold 
                            bg-gradient-to-r from-[#FF48B9] via-purple-500 to-[#12CE6A]
                            text-white
                            shadow-[0_10px_40px_rgba(255,72,185,0.3)]
                            hover:shadow-[0_15px_50px_rgba(255,72,185,0.4)]
                            hover:translate-y-[-3px]
                            active:translate-y-[1px]
                            transition-all duration-200
                            text-lg
                            inline-block
                          "
                        >
                          🚀 Start Your First Campaign
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Analytics Section */}
                      <div className="mb-16">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-1 h-8 bg-gradient-to-b from-[#12CE6A] to-emerald-600 rounded-full" />
                          <h3 className="text-3xl font-bold text-white">Campaign Analytics</h3>
                        </div>
                        <div className="space-y-5">
                          {campaigns.map((campaign, idx) => (
                            <div
                              key={campaign.id}
                              className="
                                group relative p-8 rounded-2xl
                                border border-gray-800
                                bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-slate-900/40
                                hover:border-gray-700
                                hover:bg-gradient-to-r hover:from-slate-900/60 hover:via-slate-900/40 hover:to-slate-900/60
                                transition-all duration-300
                                overflow-hidden
                              "
                              style={{
                                animation: `slideIn 0.5s ease-out ${idx * 0.1}s backwards`
                              }}
                            >
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                                style={{
                                  background: 'radial-gradient(circle at top right, rgba(255,72,185,0.1), transparent 70%)'
                                }}
                              />
                              <div className="relative z-10">
                                <h4 className="text-2xl font-bold mb-6 text-transparent bg-gradient-to-r from-[#FF48B9] via-purple-400 to-[#12CE6A] bg-clip-text">
                                  {campaign.title}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                                  <CampaignMetrics campaign={campaign} />
                                  <ProgressChart campaign={campaign} />
                                  <RevenueChart campaign={campaign} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Management Section */}
                      <div className="pb-12">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="w-1 h-8 bg-gradient-to-b from-[#FF48B9] to-rose-600 rounded-full" />
                          <h3 className="text-3xl font-bold text-white">Campaign Management</h3>
                          <span className="text-sm text-gray-400 ml-auto">Update revenue and manage campaigns</span>
                        </div>

                        <div className="space-y-8">
                          {campaigns.map((campaign, idx) => (
                            <div 
                              key={campaign.id}
                              className="
                                relative group p-8 rounded-2xl
                                border border-gray-800
                                bg-gradient-to-br from-slate-900/50 to-slate-900/20
                                hover:border-gray-700
                                hover:bg-gradient-to-br hover:from-slate-900/70 hover:to-slate-900/40
                                transition-all duration-300
                                overflow-hidden
                              "
                              style={{
                                animation: `slideIn 0.5s ease-out ${idx * 0.1}s backwards`
                              }}
                            >
                              <div className="absolute -inset-0.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur"
                                style={{
                                  background: 'linear-gradient(90deg, rgba(255,72,185,0.1), rgba(18,206,106,0.1))'
                                }}
                              />
                              
                              <div className="relative z-10">
                                {/* Campaign Title Bar */}
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-700">
                                  <div>
                                    <p className="text-sm text-gray-400 font-medium">Campaign</p>
                                    <h4 className="text-2xl font-bold text-white">{campaign.title}</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="
                                      px-4 py-2 rounded-lg
                                      bg-white/5
                                      border border-gray-700
                                      text-sm text-gray-300
                                      font-medium
                                    ">
                                      ID: {campaign.id}
                                    </div>
                                  </div>
                                </div>

                                {/* Two Column Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                  {/* Left: Campaign Stats */}
                                  <div className="
                                    p-6 rounded-xl
                                    border border-gray-800
                                    bg-black/30
                                    backdrop-blur-sm
                                  ">
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-4">Statistics</p>
                                    <CampaignStats campaign={campaign} />
                                  </div>

                                  {/* Right: Revenue Upload */}
                                  <div className="
                                    p-6 rounded-xl
                                    border border-gray-800
                                    bg-black/30
                                    backdrop-blur-sm
                                  ">
                                    <p className="text-xs text-gray-400 uppercase font-semibold tracking-wide mb-4">Revenue Management</p>
                                    <RevenueUpload
                                      campaignId={campaign.id}
                                      campaignTitle={campaign.title}
                                      campaignStatus={campaign.funding_status}
                                      onStatusChange={refreshCampaigns}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
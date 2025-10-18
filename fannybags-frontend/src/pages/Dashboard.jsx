import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { investorService } from '../services/investorService';
import HoldingsCard from '../components/investor/HoldingsCard';
import PortfolioSummary from '../components/investor/PortfolioSummary';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [holdings, setHoldings] = useState([]);
  const [totalExpected, setTotalExpected] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        setLoading(true);
        const returnsData = await investorService.getExpectedReturns(user.id);
        setHoldings(returnsData.holdings_breakdown || []);
        setTotalExpected(returnsData.total_expected_return_3m || 0);
      } catch (err) {
        setError('Failed to load investor data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user?.id, user?.role]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-4xl font-bold mb-2">
          Welcome to your <span style={{ color: '#FF48B9' }}>Dashboard</span>
        </h1>
        <p className="text-gray-400 mb-10 capitalize">Role: {role}</p>

        <div className="bg-fb-surface p-6 rounded-lg mb-10">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-400 text-sm">User ID</p>
              <p className="text-lg font-bold">{user?.id}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Role</p>
              <p className="text-lg font-bold capitalize">{role}</p>
            </div>
          </div>
        </div>

        {role === 'investor' && (
          <>
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-6">Your Portfolio</h2>

              {loading ? (
                <p className="text-gray-400">Loading your portfolio...</p>
              ) : error ? (
                <p className="text-red-400">{error}</p>
              ) : holdings.length === 0 ? (
                <div className="bg-fb-surface p-8 rounded-lg text-center">
                  <p className="text-gray-400 mb-6">You haven't invested in any campaigns yet</p>
                  <button
                    onClick={() => navigate('/campaigns')}
                    className="px-6 py-2 bg-fb-green text-white rounded hover:opacity-90 transition"
                  >
                    Explore Campaigns
                  </button>
                </div>
              ) : (
                <>
                  <PortfolioSummary holdings={holdings} totalExpected={totalExpected} />
                  <h3 className="text-xl font-bold mb-6">Your Investments</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {holdings.map((holding) => (
                      <HoldingsCard key={holding.holding_id} holding={holding} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {role === 'artist' && (
          <div className="bg-fb-surface p-8 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Artist Dashboard</h2>
            <p className="text-gray-400 mb-6">Coming soon: Create campaigns, upload revenue, view analytics</p>
            <button
              className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
            >
              Create Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
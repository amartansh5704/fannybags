import { useEffect, useState } from 'react';
import { campaignService } from '../../services/campaignService';

export default function InvestmentHistory({ campaignId }) {
  const [investments, setInvestments] = useState([]);
  const [totalInvestors, setTotalInvestors] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvestments = async () => {
      try {
        const response = await campaignService.getInvestments(campaignId);
        if (response.success) {
          setInvestments(response.data.investments);
          setTotalInvestors(response.data.total_investors);
        }
      } catch (err) {
        console.error('Failed to load investments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvestments();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="bg-fb-surface p-6 rounded-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (investments.length === 0) {
    return (
      <div className="bg-fb-surface p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Recent Investments</h3>
        <div className="text-center py-8 text-gray-400">
          <p className="text-4xl mb-2">🎯</p>
          <p>Be the first to invest!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Recent Investments</h3>
        <div className="bg-fb-pink/20 px-3 py-1 rounded-full">
          <span className="text-sm font-semibold text-fb-pink">
            {totalInvestors} Investor{totalInvestors !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {investments.map((investment, index) => (
          <div 
            key={investment.id} 
            className="flex items-start gap-4 p-4 bg-fb-dark rounded-lg hover:bg-gray-800 transition"
            style={{
              animation: `fadeIn 0.3s ease-in ${index * 0.1}s both`
            }}
          >
            {/* Green Indicator */}
            <div className="flex-shrink-0 mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>

            {/* Investment Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold text-white">
                  {investment.investor_name}
                </p>
                <p className="text-fb-pink font-bold">
                  ₹{investment.amount.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>{investment.partitions} partition{investment.partitions !== 1 ? 's' : ''}</span>
                <span>{investment.time_ago}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {investments.length >= 10 && (
        <button className="w-full mt-4 py-2 text-sm text-fb-pink hover:text-white transition">
          View All Investments →
        </button>
      )}
    </div>
  );
}
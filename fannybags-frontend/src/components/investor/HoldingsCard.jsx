import { useNavigate } from 'react-router-dom';

export default function HoldingsCard({ holding }) {
  const navigate = useNavigate();

  const expectedReturn = holding.expected_personal_return_3m || 0;

  return (
    <div
      onClick={() => navigate(`/campaign/${holding.campaign_id}`)}
      className="bg-fb-surface p-6 rounded-lg cursor-pointer hover:transform hover:scale-105 transition border border-gray-700"
    >
      <div className="mb-4">
        <div className="w-full h-32 bg-gradient-to-r from-fb-purple to-fb-pink rounded flex items-center justify-center">
          <span className="text-4xl">🎵</span>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-1">{holding.campaign_title}</h3>
      <p className="text-sm text-gray-400 mb-4">by {holding.artist_name}</p>

      <div className="bg-fb-dark p-3 rounded mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Partitions Owned:</span>
          <span className="font-bold">{holding.partitions_owned}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Your Ownership:</span>
          <span className="font-bold text-fb-pink">{holding.ownership_pct.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Campaign Share:</span>
          <span className="font-bold text-fb-green">{holding.revenue_share_pct}%</span>
        </div>
      </div>

      <div className="bg-fb-dark p-3 rounded">
        <p className="text-xs text-gray-400 mb-1">Expected Return (3 months)</p>
        <p className="text-xl font-bold text-fb-green">₹{expectedReturn.toFixed(0)}</p>
        <p className="text-xs text-gray-400 mt-1">
          Campaign expects: ₹{holding.expected_campaign_revenue_3m?.toLocaleString() || 'N/A'}
        </p>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Status: <span className="capitalize text-fb-pink">{holding.campaign_status}</span>
      </p>
    </div>
  );
}
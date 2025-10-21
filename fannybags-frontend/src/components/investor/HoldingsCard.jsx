import { useNavigate } from 'react-router-dom';

export default function HoldingsCard({ holding }) {
  const navigate = useNavigate();

  const investmentAmount = holding.investment_amount || 0;
  const expectedReturn = holding.expected_return_3m || 0;

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

      <h3 className="text-lg font-bold mb-1 truncate">{holding.campaign_title}</h3>
      <p className="text-sm text-gray-400 mb-4">by {holding.artist_name}</p>

      <div className="bg-fb-dark p-3 rounded mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Investment:</span>
          <span className="font-bold text-white">₹{investmentAmount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Partitions:</span>
          <span className="font-bold">{holding.partitions_owned || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-400">Status:</span>
          <span className="capitalize text-fb-pink font-bold">{holding.campaign_status || 'N/A'}</span>
        </div>
      </div>

      <div className="bg-fb-dark p-3 rounded">
        <p className="text-xs text-gray-400 mb-1">Expected Return (3m)</p>
        <p className="text-xl font-bold text-fb-green">₹{expectedReturn.toLocaleString()}</p>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Invested on {new Date(holding.date_invested).toLocaleDateString()}
      </p>
    </div>
  );
}
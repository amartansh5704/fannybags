export default function EarningsCard({ holding, actualEarnings = 0 }) {
  const investmentAmount = holding.investment_amount || 0;
  const expectedReturn = holding.expected_return_3m || 0;
  
  const roi = investmentAmount > 0 
    ? ((actualEarnings / investmentAmount) * 100).toFixed(2)
    : 0;
  
  const isProfitable = actualEarnings > 0;

  return (
    <div className="bg-fb-surface p-6 rounded-lg border border-fb-green hover:border-fb-pink transition">
      <h3 className="text-lg font-bold mb-4 truncate">{holding.campaign_title}</h3>
      
      <div className="space-y-4">
        {/* Investment Amount */}
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">Invested</p>
          <p className="text-xl font-bold text-white">₹{investmentAmount.toLocaleString()}</p>
        </div>

        {/* Actual Earnings */}
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">Actual Earnings</p>
          <p className="text-2xl font-bold text-fb-green">₹{(actualEarnings || 0).toLocaleString()}</p>
        </div>

        {/* ROI */}
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">ROI</p>
          <p className={`text-xl font-bold ${isProfitable ? 'text-fb-green' : 'text-gray-400'}`}>
            {roi}%
          </p>
        </div>

        {/* Expected Return */}
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">Expected (3m)</p>
          <p className="text-lg font-bold text-fb-pink">₹{expectedReturn.toLocaleString()}</p>
        </div>

        {/* Additional Info */}
        <div className="border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-400">Partitions: {holding.partitions_owned}</p>
          <p className="text-xs text-gray-400">Status: <span className="capitalize text-fb-pink">{holding.campaign_status}</span></p>
        </div>
      </div>
    </div>
  );
}
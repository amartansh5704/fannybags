export default function EarningsCard({ holding }) {
  const potentialEarnings = holding.expected_personal_return_3m || 0;
  const actualEarnings = holding.actual_earnings || 0;
  const pendingEarnings = potentialEarnings - actualEarnings;

  return (
    <div className="bg-fb-surface p-6 rounded-lg border border-fb-green">
      <h3 className="text-lg font-bold mb-4">{holding.campaign_title}</h3>

      <div className="space-y-4">
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">Actual Earnings</p>
          <p className="text-2xl font-bold text-fb-green">₹{(actualEarnings || 0).toFixed(0)}</p>
        </div>

        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">Expected (3m)</p>
          <p className="text-xl font-bold text-fb-pink">₹{potentialEarnings.toFixed(0)}</p>
        </div>

        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-500">₹{(pendingEarnings > 0 ? pendingEarnings : 0).toFixed(0)}</p>
        </div>

        <div className="border-t border-gray-700 pt-3">
          <p className="text-xs text-gray-400">Partitions: {holding.partitions_owned}</p>
          <p className="text-xs text-gray-400">Your Share: {holding.your_ownership_pct?.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
}
export default function PayoutHistory({ transactions }) {
  // 🔥 FIXED: Filter for transaction_type === 'payout'
  const payouts = transactions.filter(t => 
    t.transaction_type === 'payout' || 
    t.type === 'payout' || // Fallback for different format
    t.type === 'revenue_distribution' // Legacy support
  );

  if (payouts.length === 0) {
    return (
      <div className="bg-fb-surface p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">💸 Payout History</h3>
        <p className="text-gray-400 text-sm">No payouts yet. Earnings will show here once revenue is distributed.</p>
      </div>
    );
  }

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">💸 Payout History</h3>
      <p className="text-gray-400 text-xs mb-4">
        Showing {payouts.length} payout{payouts.length !== 1 ? 's' : ''}
      </p>
      <div className="space-y-3">
        {payouts.map((payout) => (
          <div key={payout.id} className="bg-fb-dark p-4 rounded border border-gray-700 hover:border-fb-green transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold text-fb-green">+₹{payout.amount.toFixed(0)}</p>
              <span className="text-xs px-2 py-1 bg-fb-green text-white rounded capitalize">
                {payout.status}
              </span>
            </div>
            <p className="text-sm text-gray-300">{payout.description}</p>
            <p className="text-xs text-gray-500 mt-2">
              📅 {new Date(payout.created_at).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'short', 
                year: 'numeric' 
              })}
            </p>
          </div>
        ))}
      </div>
      
      {/* Total Earnings Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Payouts Received:</span>
          <span className="text-xl font-bold text-fb-green">
            ₹{payouts.reduce((sum, p) => sum + p.amount, 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
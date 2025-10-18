export default function PayoutHistory({ transactions }) {
  const payouts = transactions.filter(t => t.type === 'payout');

  if (payouts.length === 0) {
    return (
      <div className="bg-fb-surface p-6 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Payout History</h3>
        <p className="text-gray-400 text-sm">No payouts yet. Earnings will show here once revenue is distributed.</p>
      </div>
    );
  }

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Payout History</h3>
      <div className="space-y-3">
        {payouts.map((payout) => (
          <div key={payout.id} className="bg-fb-dark p-4 rounded border border-gray-700">
            <div className="flex justify-between items-start mb-2">
              <p className="font-semibold">₹{payout.amount.toFixed(0)}</p>
              <span className="text-xs px-2 py-1 bg-fb-green text-white rounded capitalize">
                {payout.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">{payout.description}</p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(payout.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
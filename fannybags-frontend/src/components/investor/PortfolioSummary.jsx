export default function PortfolioSummary({ portfolio, wallet }) {
  const profitLoss = portfolio?.total_earnings || 0;
  const isProfitable = profitLoss > 0;
  
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
      {/* Wallet Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 rounded-lg shadow-lg">
        <p className="text-white/80 text-sm mb-2">💰 Wallet Balance</p>
        <p className="text-3xl font-bold text-white">₹{(wallet?.balance || 0).toLocaleString()}</p>
        <p className="text-xs text-white/60 mt-2">Available to invest</p>
      </div>

      {/* Total Invested */}
      <div className="bg-fb-surface p-6 rounded-lg border border-blue-500">
        <p className="text-gray-400 text-sm mb-2">📊 Total Invested</p>
        <p className="text-3xl font-bold text-white">₹{(portfolio?.total_invested || 0).toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-2">
          In {portfolio?.number_of_campaigns || 0} campaigns
        </p>
      </div>

      {/* Total Earnings */}
      <div className="bg-fb-surface p-6 rounded-lg border border-green-500">
        <p className="text-gray-400 text-sm mb-2">💸 Total Earnings</p>
        <p className="text-3xl font-bold text-fb-green">₹{(portfolio?.total_earnings || 0).toLocaleString()}</p>
        <p className="text-xs text-gray-500 mt-2">Revenue received</p>
      </div>

      {/* ROI */}
      <div className={`bg-fb-surface p-6 rounded-lg border ${isProfitable ? 'border-fb-green' : 'border-gray-600'}`}>
        <p className="text-gray-400 text-sm mb-2">📈 Overall ROI</p>
        <p className={`text-3xl font-bold ${isProfitable ? 'text-fb-green' : 'text-gray-400'}`}>
          {(portfolio?.overall_roi || 0).toFixed(2)}%
        </p>
        <p className={`text-xs mt-2 ${isProfitable ? 'text-green-400' : 'text-gray-500'}`}>
          {isProfitable ? `+₹${profitLoss.toLocaleString()} profit` : 'No earnings yet'}
        </p>
      </div>
    </div>
  );
}
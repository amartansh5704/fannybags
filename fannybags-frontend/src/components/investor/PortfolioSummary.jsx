export default function PortfolioSummary({ holdings, totalExpected }) {
  const numberOfCampaigns = holdings.length;
  
  const averageOwnership = numberOfCampaigns > 0
    ? (holdings.reduce((sum, h) => {
        const ownership = h.your_ownership_pct || h.ownership_pct || 0;
        return sum + (isNaN(ownership) ? 0 : ownership);
      }, 0) / numberOfCampaigns).toFixed(2)
    : 0;

  return (
    <div className="grid md:grid-cols-4 gap-4 mb-10">
      <div className="bg-fb-surface p-6 rounded-lg border border-fb-pink">
        <p className="text-gray-400 text-sm mb-2">Total Campaigns</p>
        <p className="text-3xl font-bold text-fb-pink">{numberOfCampaigns}</p>
      </div>

      <div className="bg-fb-surface p-6 rounded-lg border border-fb-green">
        <p className="text-gray-400 text-sm mb-2">Expected Return (3m)</p>
        <p className="text-3xl font-bold text-fb-green">₹{(totalExpected || 0).toFixed(0)}</p>
      </div>

      <div className="bg-fb-surface p-6 rounded-lg border border-fb-purple">
        <p className="text-gray-400 text-sm mb-2">Avg Ownership</p>
        <p className="text-3xl font-bold text-white">{isNaN(averageOwnership) ? '0' : averageOwnership}%</p>
      </div>

      <div className="bg-fb-surface p-6 rounded-lg border border-gray-600">
        <p className="text-gray-400 text-sm mb-2">Portfolio Health</p>
        <p className="text-3xl font-bold text-fb-pink">
          {numberOfCampaigns > 0 ? 'Active' : 'Empty'}
        </p>
      </div>
    </div>
  );
}
import React from 'react';

export default function CampaignMetrics({ campaign }) {
  // Calculate metrics from campaign data
  const totalRaised = campaign.amount_raised || 0;
  const targetAmount = campaign.target_amount || 1;
  const fundingPercentage = (totalRaised / targetAmount) * 100;
  const expectedRevenue = campaign.expected_revenue_3m || 0;
  const actualRevenue = campaign.actual_revenue || 0;
  const investorsCount = campaign.investors_count || 0;

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-6">Campaign Analytics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Raised */}
        <div className="bg-fb-dark p-4 rounded border border-fb-green">
          <p className="text-gray-400 text-sm">Total Raised</p>
          <p className="text-2xl font-bold text-fb-green">₹{totalRaised.toLocaleString()}</p>
        </div>

        {/* Number of Investors */}
        <div className="bg-fb-dark p-4 rounded border border-fb-pink">
          <p className="text-gray-400 text-sm">Investors</p>
          <p className="text-2xl font-bold text-fb-pink">{investorsCount}</p>
        </div>

        {/* Funding Percentage */}
        <div className="bg-fb-dark p-4 rounded border border-blue-500">
          <p className="text-gray-400 text-sm">Funding %</p>
          <p className="text-2xl font-bold text-blue-400">{fundingPercentage.toFixed(1)}%</p>
        </div>

        {/* Revenue Comparison */}
        <div className="bg-fb-dark p-4 rounded border border-yellow-500">
          <p className="text-gray-400 text-sm">Revenue (3m)</p>
          <p className="text-lg font-bold text-yellow-400">₹{actualRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Expected: ₹{expectedRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
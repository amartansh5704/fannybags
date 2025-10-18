export default function CampaignStats({ campaign }) {
  const progressPercent = (campaign.amount_raised / campaign.target_amount) * 100;

  return (
    <div className="bg-fb-surface p-6 rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold mb-4">{campaign.title}</h3>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Funding Progress</span>
          <span>{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-fb-green h-2 rounded-full"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>₹{campaign.amount_raised.toLocaleString()}</span>
          <span>₹{campaign.target_amount.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs">Revenue Share</p>
          <p className="font-bold text-fb-pink">{campaign.revenue_share_pct}%</p>
        </div>
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs">Partition Price</p>
          <p className="font-bold">₹{campaign.partition_price}</p>
        </div>
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs">Status</p>
          <p className="font-bold capitalize text-fb-green">{campaign.funding_status}</p>
        </div>
        <div className="bg-fb-dark p-3 rounded">
          <p className="text-gray-400 text-xs">Total Partitions</p>
          <p className="font-bold">{campaign.total_partitions}</p>
        </div>
      </div>
    </div>
  );
}
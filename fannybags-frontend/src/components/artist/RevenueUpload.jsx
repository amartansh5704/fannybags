import { useState } from 'react';
import { campaignService } from '../../services/campaignService';

export default function RevenueUpload({ campaignId, campaignTitle, campaignStatus, onStatusChange }) {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('spotify');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await campaignService.uploadRevenue(campaignId, {
        amount: parseFloat(amount),
        source,
      });
      setSuccess(`₹${amount} revenue recorded from ${source}!`);
      setAmount('');
      setSource('spotify');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload revenue');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      setLoading(true);
      await campaignService.publishCampaign(campaignId);
      setSuccess('Campaign published successfully!');
      onStatusChange();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleDistribute = async () => {
    try {
      setLoading(true);
      await campaignService.distributeRevenue(campaignId);
      setSuccess('Revenue distributed to investors!');
      onStatusChange();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to distribute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-fb-dark p-4 rounded border border-gray-700 mt-2">
      <h4 className="font-semibold mb-4">{campaignTitle}</h4>

      {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      {success && <p className="text-fb-green text-sm mb-2">{success}</p>}

      {campaignStatus === 'draft' && (
        <button
          onClick={handlePublish}
          disabled={loading}
          className="w-full py-2 bg-fb-pink text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish to Explore'}
        </button>
      )}

      {campaignStatus === 'live' && (
        <>
          <form onSubmit={handleSubmit} className="space-y-2 mb-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="px-2 py-1 bg-fb-surface text-white border border-gray-600 rounded text-sm"
                placeholder="Amount (₹)"
              />
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="px-2 py-1 bg-fb-surface text-white border border-gray-600 rounded text-sm"
              >
                <option value="spotify">Spotify</option>
                <option value="youtube">YouTube</option>
                <option value="apple">Apple</option>
                <option value="manual">Manual</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-fb-green text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
            >
              Record Revenue
            </button>
          </form>

          <button
            onClick={handleDistribute}
            disabled={loading}
            className="w-full py-2 bg-fb-purple text-white rounded text-sm hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Distributing...' : 'Calculate & Distribute'}
          </button>
        </>
      )}
    </div>
  );
}
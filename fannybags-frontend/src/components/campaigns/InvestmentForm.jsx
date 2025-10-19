import { useState, useMemo } from 'react';
import { campaignService } from '../../services/campaignService';

export default function InvestmentForm({
  campaignId,
  partitionPrice,
  minPartitions = 1,
  availablePartitions = 0,
  onClose,
  onSuccess
}) {
  const [qty, setQty] = useState(minPartitions);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(() => (qty || 0) * (partitionPrice || 0), [qty, partitionPrice]);

  const canDecrement = qty > minPartitions;
  const canIncrement = qty < availablePartitions;

  const handleDecrement = () => {
    if (canDecrement) setQty(qty - 1);
  };

  const handleIncrement = () => {
    if (canIncrement) setQty(qty + 1);
  };

  const handleQtyChange = (e) => {
    const val = parseInt(e.target.value || '0', 10);
    if (Number.isNaN(val)) return;
    const clamped = Math.max(minPartitions, Math.min(val, availablePartitions));
    setQty(clamped);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!agree) {
      setError('Please agree to the terms to continue.');
      return;
    }
    if (qty < minPartitions) {
      setError(`Minimum ${minPartitions} partitions required.`);
      return;
    }
    if (qty > availablePartitions) {
      setError('Not enough partitions available.');
      return;
    }

    try {
      setLoading(true);
      await campaignService.buyCampaign(campaignId, qty);
      if (onSuccess) onSuccess({ qty, total });
    } catch (err) {
      const msg = err?.response?.data?.error || 'Purchase failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-fb-surface p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Invest in this Campaign</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm mb-1">Partitions</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecrement}
              className="px-3 py-2 bg-gray-700 rounded disabled:opacity-50"
              disabled={!canDecrement}
            >
              −
            </button>
            <input
              type="number"
              value={qty}
              onChange={handleQtyChange}
              className="w-24 bg-fb-dark border border-gray-700 rounded px-3 py-2 text-white"
              min={minPartitions}
              max={availablePartitions}
            />
            <button
              type="button"
              onClick={handleIncrement}
              className="px-3 py-2 bg-gray-700 rounded disabled:opacity-50"
              disabled={!canIncrement}
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Min {minPartitions}. Available {availablePartitions}.
          </p>
        </div>

        <div className="bg-fb-dark p-3 rounded border border-gray-700">
          <p className="text-sm text-gray-400">Price per partition</p>
          <p className="text-lg font-semibold">₹{(partitionPrice || 0).toLocaleString()}</p>
        </div>

        <div className="bg-fb-dark p-3 rounded border border-gray-700">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-xl font-bold text-fb-pink">₹{total.toLocaleString()}</p>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree to the terms and conditions
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-fb-pink text-white rounded disabled:opacity-50"
            disabled={loading || !agree || qty < minPartitions || qty > availablePartitions}
          >
            {loading ? 'Processing...' : 'Invest'}
          </button>
        </div>
      </form>
    </div>
  );
}
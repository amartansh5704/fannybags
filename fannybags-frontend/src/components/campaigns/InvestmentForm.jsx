import { useState, useMemo, useEffect } from 'react';
import { campaignService } from '../../services/campaignService';
import walletService from '../../services/walletService';
import ElectricBorder from '../reactbits/animations/ElectricBorder';
import ClickSpark from '../reactbits/animations/ClickSpark';

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
  const [useWallet, setUseWallet] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  const total = useMemo(() => (qty || 0) * (partitionPrice || 0), [qty, partitionPrice]);

  const canDecrement = qty > minPartitions;
  const canIncrement = qty < availablePartitions;

  // Fetch wallet balance on mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await walletService.getBalance();
        if (response.success) {
          setWalletBalance(response.data.balance);
        }
      } catch {
        console.log('Wallet not available, using traditional payment');
        setUseWallet(false);
      } finally {
        setLoadingWallet(false);
      }
    };
    fetchBalance();
  }, []);

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

    // Check wallet balance if using wallet
    if (useWallet && walletBalance < total) {
      setError(`Insufficient wallet balance. You have ₹${walletBalance.toLocaleString()}. Need ₹${total.toLocaleString()}`);
      return;
    }

    try {
      setLoading(true);
      
      if (useWallet) {
        // Use wallet investment endpoint
        await walletService.investFromWallet(campaignId, total);
      } else {
        // Use traditional payment
        await campaignService.buyCampaign(campaignId, qty);
      }
      
      if (onSuccess) onSuccess({ qty, total });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Purchase failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const hasEnoughBalance = walletBalance >= total;

  return (
    <ElectricBorder 
      color="#FF48B9" 
      speed={0.8} 
      chaos={0.6} 
      thickness={2} 
      style={{ borderRadius: '0.5rem' }}
    >
      <div className="bg-fb-surface p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">Invest in this Campaign</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Wallet Balance Display */}
          {!loadingWallet && (
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-4 rounded-lg border border-blue-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">💰 Wallet Balance</span>
                <button
                  type="button"
                  onClick={() => window.open('/wallet', '_blank')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Manage Wallet →
                </button>
              </div>
              <div className="text-2xl font-bold text-white">
                ₹{walletBalance.toLocaleString()}
              </div>
              {!hasEnoughBalance && total > 0 && (
                <p className="text-xs text-red-400 mt-2">
                  ⚠️ Need ₹{(total - walletBalance).toLocaleString()} more
                </p>
              )}
            </div>
          )}

          {/* Payment Method Toggle */}
          <div className="flex gap-2 p-1 bg-fb-dark rounded-lg">
            <button
              type="button"
              onClick={() => setUseWallet(true)}
              className={`flex-1 py-2 rounded transition ${
                useWallet 
                  ? 'bg-fb-pink text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💰 Wallet
            </button>
            <button
              type="button"
              onClick={() => setUseWallet(false)}
              className={`flex-1 py-2 rounded transition ${
                !useWallet 
                  ? 'bg-fb-pink text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💳 Card/UPI
            </button>
          </div>

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
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            
            <ClickSpark sparkColor="#12CE6A" sparkRadius={25} sparkCount={12}>
              <button
                type="submit"
                className="px-4 py-2 bg-fb-pink text-white rounded disabled:opacity-50 hover:bg-opacity-90 transition"
                disabled={loading || !agree || qty < minPartitions || qty > availablePartitions || (useWallet && !hasEnoughBalance)}
              >
                {loading ? 'Processing...' : useWallet ? '💰 Invest from Wallet' : '💳 Pay & Invest'}
              </button>
            </ClickSpark>
          </div>
        </form>
      </div>
    </ElectricBorder>
  );
}
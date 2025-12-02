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
      style={{ borderRadius: '1.25rem' }}
    >
      <div className="bg-fb-surface p-10 rounded-2xl" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Helvetica, Arial, sans-serif' }}>
        <h3 className="text-xl font-medium mb-8 text-center text-white tracking-tight" style={{ letterSpacing: '-0.02em' }}>
          Invest in this Campaign
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-lg mx-auto">
          {/* Wallet Balance Display */}
          {!loadingWallet && (
            <div className="bg-gradient-to-r from-blue-600/8 to-purple-600/8 p-5 rounded-xl border border-blue-500/15 text-center backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">Wallet Balance</span>
                <button
                  type="button"
                  onClick={() => window.open('/wallet', '_blank')}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider"
                >
                  Manage
                </button>
              </div>
              <div className="text-3xl font-light text-white tracking-tighter" style={{ 
                letterSpacing: '-0.04em',
                fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                fontVariantNumeric: 'tabular-nums'
              }}>
                ₹{walletBalance.toLocaleString()}
              </div>
              {!hasEnoughBalance && total > 0 && (
                <p className="text-xs text-red-400 mt-2 font-normal">
                  Insufficient funds. Need ₹{(total - walletBalance).toLocaleString()} more
                </p>
              )}
            </div>
          )}

          {/* Payment Method Toggle */}
          <div className="flex gap-1.5 p-1.5 bg-gray-800/30 rounded-xl backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setUseWallet(true)}
              className={`flex-1 py-2.5 rounded-lg font-normal text-sm transition-all ${
                useWallet 
                  ? 'bg-white/8 text-white backdrop-blur-md shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Wallet
            </button>
            <button
              type="button"
              onClick={() => setUseWallet(false)}
              className={`flex-1 py-2.5 rounded-lg font-normal text-sm transition-all ${
                !useWallet 
                  ? 'bg-white/8 text-white backdrop-blur-md shadow-sm' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Card/UPI
            </button>
          </div>

          {/* Partition Selector */}
          <div className="py-2">
            <label className="block text-gray-400 text-[11px] font-medium mb-4 text-center uppercase tracking-widest">
              Number of Partitions
            </label>
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleDecrement}
                className="w-11 h-11 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700/50 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-light text-gray-300"
                disabled={!canDecrement}
              >
                −
              </button>
              <input
                type="number"
                value={qty}
                onChange={handleQtyChange}
                className="w-24 h-11 bg-transparent border border-gray-700/40 rounded-lg px-3 text-white text-center text-lg font-normal focus:border-gray-500 focus:outline-none transition-colors"
                style={{ 
                  letterSpacing: '-0.01em',
                  fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                  fontVariantNumeric: 'tabular-nums'
                }}
                min={minPartitions}
                max={availablePartitions}
              />
              <button
                type="button"
                onClick={handleIncrement}
                className="w-11 h-11 bg-gray-800/50 backdrop-blur-sm rounded-full hover:bg-gray-700/50 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex items-center justify-center text-lg font-light text-gray-300"
                disabled={!canIncrement}
              >
                +
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-3 text-center font-normal">
              Minimum {minPartitions} · Available {availablePartitions}
            </p>
          </div>

          {/* Price per Partition - Compact */}
          <div className="bg-gray-800/20 backdrop-blur-sm px-5 py-3.5 rounded-xl border border-gray-700/20 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 uppercase tracking-widest font-medium">Price per Partition</span>
            <span className="text-base font-normal text-white" style={{ 
              letterSpacing: '-0.02em',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              ₹{(partitionPrice || 0).toLocaleString()}
            </span>
          </div>

          {/* Total Amount - Compact */}
          <div className="bg-gradient-to-r from-pink-600/10 to-purple-600/10 px-5 py-3.5 rounded-xl backdrop-blur-sm flex items-center justify-between">
            <span className="text-[11px] text-gray-300 uppercase tracking-widest font-medium">Total Investment</span>
            <span className="text-2xl font-light text-fb-pink tracking-tighter" style={{ 
              letterSpacing: '-0.04em',
              fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              ₹{total.toLocaleString()}
            </span>
          </div>

          {/* Terms Checkbox */}
          <label className="flex items-center justify-center gap-3 text-sm cursor-pointer py-1.5">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-fb-pink focus:ring-fb-pink focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-gray-400 font-normal">I agree to the terms and conditions</span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/8 border border-red-500/25 rounded-xl px-4 py-3 text-center backdrop-blur-sm">
              <p className="text-xs text-red-400 font-normal">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-3">
            <ClickSpark sparkColor="#12CE6A" sparkRadius={25} sparkCount={12}>
              <button
                type="submit"
                className="w-full px-6 py-4 bg-gradient-to-r from-fb-pink to-purple-600 text-white rounded-xl disabled:opacity-35 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-fb-pink/20 transition-all font-normal text-base tracking-wide"
                style={{ letterSpacing: '0.01em' }}
                disabled={loading || !agree || qty < minPartitions || qty > availablePartitions || (useWallet && !hasEnoughBalance)}
              >
                {loading ? 'Processing...' : useWallet ? 'Invest from Wallet' : 'Pay & Invest'}
              </button>
            </ClickSpark>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-2.5 bg-transparent text-gray-400 hover:text-white rounded-lg transition-all font-normal text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ElectricBorder>
  );
}
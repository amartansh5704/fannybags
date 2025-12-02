import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistWalletService } from '../services/artistWalletService';
import { useAuthStore } from '../store/authStore';

export default function ArtistPayout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingWithdraw, setLoadingWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 🚫 Block non-artists
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user?.role !== 'artist') {
      setError('Only artists can access the payout dashboard.');
    }
  }, [isAuthenticated, user]);

  // 💰 Load wallet balance on mount
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await artistWalletService.getBalance();
        setWallet(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load wallet balance');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) load();
    else setLoading(false);
  }, [isAuthenticated]);

  const handleMax = () => {
    if (!wallet) return;
    setAmount(wallet.balance.toFixed(2));
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!wallet) {
      setError('Wallet not loaded yet.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError('Enter a valid withdrawal amount.');
      return;
    }

    if (numericAmount > wallet.balance) {
      setError('Amount cannot be greater than available balance.');
      return;
    }

    setLoadingWithdraw(true);

    try {
      await artistWalletService.withdraw(numericAmount);

      // Refresh wallet after withdraw
      const updated = await artistWalletService.getBalance();
      setWallet(updated);

      setSuccessMsg('Withdrawal request submitted for review.');
      setAmount('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Withdrawal failed.');
    } finally {
      setLoadingWithdraw(false);
    }
  };

  // 🧱 Basic layout if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05030A] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-300 text-sm">
            Please log in as an artist to access payouts.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-sm font-semibold shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 🛑 If logged in but not artist
  if (user?.role !== 'artist') {
    return (
      <div className="min-h-screen bg-[#05030A] text-white flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto p-6 rounded-2xl bg-slate-900/70 border border-slate-700/60">
          <p className="text-sm text-gray-300 mb-3">
            This area is only for artists.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030A] text-white">
      {/* Glowing background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 15% 20%, rgba(255,72,185,0.22) 0%, transparent 55%),
            radial-gradient(circle at 85% 30%, rgba(56,189,248,0.18) 0%, transparent 60%),
            radial-gradient(circle at 10% 80%, rgba(34,197,94,0.18) 0%, transparent 55%),
            #020617
          `,
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-1">
            Artist Wallet
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Payout Dashboard
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Withdraw your artist fees that have been allocated to your wallet.
          </p>
        </div>

        {/* Error + Success Messages */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-900/20 px-4 py-3 text-xs text-red-200">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-900/20 px-4 py-3 text-xs text-emerald-200">
            {successMsg}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          {/* Wallet Summary */}
          <div className="rounded-2xl p-6 sm:p-7 border border-slate-700/70 bg-slate-900/70 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.9)]">
            <div className="flex items-start justify-between gap-3 mb-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                  Current Artist Balance
                </p>

                {loading ? (
                  <div className="mt-3 h-7 w-28 rounded-md bg-slate-700/60 animate-pulse" />
                ) : (
                  <p className="mt-2 text-3xl font-semibold">
                    ₹{wallet ? wallet.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                  Artist ID
                </span>
                <span className="text-xs text-gray-300 font-medium">
                  #{user?.id}
                </span>
              </div>
            </div>

            {!loading && wallet && (
              <div className="grid grid-cols-3 gap-3 text-[11px] text-gray-300">
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Total Earnings</p>
                  <p className="font-semibold text-sm">
                    ₹{wallet.total_earnings.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Withdrawn</p>
                  <p className="font-semibold text-sm">
                    ₹{wallet.total_withdrawn.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700/70 bg-slate-900/60 p-3">
                  <p className="text-[10px] text-gray-500 mb-1">Available</p>
                  <p className="font-semibold text-sm text-emerald-300">
                    ₹{wallet.balance.toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Withdraw Form */}
          <div className="rounded-2xl p-6 sm:p-7 border border-pink-500/40 bg-slate-900/80 backdrop-blur-xl shadow-[0_24px_60px_rgba(236,72,153,0.4)]">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-300 mb-1">
              Request Payout
            </p>
            <p className="text-xs text-gray-400 mb-5">
              Submit a withdrawal request. Funds will be reviewed and processed.
            </p>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-300 mb-1.5">
                  Amount to Withdraw (₹)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 rounded-lg bg-slate-950/80 border border-slate-700/80 px-3 py-2 text-sm text-white"
                    placeholder="Enter amount"
                  />
                  <button
                    type="button"
                    onClick={handleMax}
                    disabled={!wallet || loading}
                    className="px-3 py-2 rounded-lg border border-slate-600/80 text-[11px]"
                  >
                    Max
                  </button>
                </div>

                {wallet && (
                  <p className="mt-1 text-[11px] text-gray-500">
                    Available: <span className="text-gray-200">₹{wallet.balance.toLocaleString()}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loadingWithdraw || loading || !wallet}
                className="w-full mt-1 rounded-lg bg-gradient-to-r from-pink-600 via-pink-500 to-orange-400 px-4 py-2.5 text-sm font-semibold shadow-lg hover:opacity-95"
              >
                {loadingWithdraw ? 'Processing…' : 'Submit Withdrawal Request'}
              </button>

              <p className="text-[10px] text-gray-500 leading-relaxed mt-2">
                Withdrawals are marked as pending and processed manually by the platform.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

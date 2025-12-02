import React, { useState, useEffect } from 'react';
import walletService from '../../services/walletService';
import DepositModal from '../wallet/DepositModal';
import { showToast } from '../../utils/animations';
import CountUp from '../reactbits/text/CountUp';

const WalletDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // 🌟 NEW — show/hide full transaction section
  const [showTransactions, setShowTransactions] = useState(false);

  // UI state
  const [showDetails, setShowDetails] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(1, 10),
      ]);
      if (balanceRes.success) setWallet(balanceRes.data);
      if (transRes.success) setTransactions(transRes.data.transactions);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDepositSuccess = (data) => {
    showToast.success(
      `🎉 Successfully deposited ₹${data.amount.toLocaleString()}! New balance: ₹${data.new_balance.toLocaleString()}`
    );

    setSuccess(
      `Successfully deposited ₹${data.amount.toLocaleString()}! New balance: ₹${data.new_balance.toLocaleString()}`
    );

    fetchWalletData();
    setTimeout(() => setSuccess(''), 5000);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      setProcessing(true);
      setError('');
      const response = await walletService.withdraw(amount);
      if (response.success) {
        setSuccess(`Successfully withdrew ₹${amount}`);
        setAmount('');
        setShowWithdrawModal(false);
        fetchWalletData();
        setTimeout(() => setSuccess(''), 5000);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: '💰',
      withdraw: '🏦',
      investment: '📈',
      payout: '💸',
    };
    return icons[type] || '📝';
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: 'text-green-500',
      withdraw: 'text-red-500',
      investment: 'text-blue-500',
      payout: 'text-green-500',
    };
    return colors[type] || 'text-gray-400';
  };

  const filteredTransactions =
    activeFilter === 'all'
      ? transactions
      : transactions.filter((tx) => {
          if (activeFilter === 'deposited') return tx.transaction_type === 'deposit';
          if (activeFilter === 'invested') return tx.transaction_type === 'investment';
          if (activeFilter === 'earnings') return tx.transaction_type === 'payout';
          if (activeFilter === 'withdrawn') return tx.transaction_type === 'withdraw';
          return true;
        });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-fb-dark text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--fb-pink)]" />
      </div>
    );
  }

  return (
    <div
  className="
    w-full 
    min-h-screen 
    flex 
    flex-col 
    items-center
    justify-center
    px-4 
    text-white
    bg-gradient-to-b 
    from-[#120016] 
    via-[#05000C] 
    to-[#000000]
    
  "
>
      {/* Toast-style banners */}
      {error && (
        <div className="mb-4 max-w-lg w-full animate-[fadeIn_0.4s_ease-out] p-4 bg-red-500/10 border border-red-500/40 rounded-2xl text-red-200 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 max-w-lg w-full animate-[fadeIn_0.4s_ease-out] p-4 bg-emerald-500/10 border border-emerald-500/40 rounded-2xl text-emerald-200 text-sm shadow-[0_12px_30px_rgba(0,0,0,0.6)]">
          {success}
        </div>
      )}

      {/* WALLET CARD */}
      <div
        className="
          relative 
          max-w-xl 
          w-full
          translate-x-28
          overflow-hidden 
          rounded-[26px]
          p-6 md:p-8 mb-6
          shadow-[0_0_45px_rgba(255,72,185,0.55),0_0_90px_rgba(18,206,106,0.3)]
          backdrop-blur-2xl
          border border-white/12
          transition-all duration-300 ease-out
          hover:shadow-[0_0_60px_rgba(255,72,185,0.7),0_0_110px_rgba(18,206,106,0.4)]
          hover:-translate-y-1
          animate-[fadeIn_0.55s_ease-out]
        "
        style={{
          background:
            'linear-gradient(135deg, #12001f 0%, #50207A 18%, #FF48B9 52%, #12CE6A 115%)',
        }}
      >
        {/* soft neon bloom */}
        <div className="pointer-events-none absolute inset-0 opacity-90 mix-blend-screen bg-[radial-gradient(circle_at_0_0,#ff48b9dd,transparent_50%),radial-gradient(circle_at_100%_0,#12ce6a77,transparent_55%),radial-gradient(circle_at_50%_120%,#ff48b977,transparent_55%)]" />

        <div className="relative flex flex-col gap-6">
          {/* header */}
          <div className="flex flex-col items-center justify-center gap-4 w-full">
  <div className="text-center">
    <p className="text-sm md:text-base opacity-85"></p>
    <div className="mt-2 text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-[0_4px_18px_rgba(0,0,0,0.6)]">
      ₹
      <CountUp
        from={0}
        to={wallet?.balance || 0}
        duration={1.5}
        separator=","
        className="inline-block"
      />
    </div>
    <p className="mt-1 text-xs md:text-sm opacity-80">
      Current Wallet Balance
    </p>
  </div>

            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="
                inline-flex items-center gap-2 
                rounded-full 
                bg-black/35 
                px-4 py-2 
                text-xs md:text-sm 
                backdrop-blur-md 
                border border-white/25 
                shadow-[0_6px_16px_rgba(0,0,0,0.45)]
                hover:bg-black/55
                transition-all duration-200
              "
            >
              {showDetails ? 'Show less' : 'Show more'}
              <span className="inline-block text-lg leading-none">
                {showDetails ? '▴' : '▾'}
              </span>
            </button>
          </div>

          {/* compact summary */}
          {!showDetails && (
  <div className="grid grid-cols-2 gap-4 text-xs md:text-sm mt-2 justify-center">
    <div className="bg-black/25 rounded-2xl px-4 py-3 backdrop-blur border border-white/10 text-center">
      <p className="opacity-80">Total Deposited</p>
      <p className="mt-1 font-semibold">
        ₹{wallet?.total_deposited?.toLocaleString()}
      </p>
    </div>
    <div className="bg-black/25 rounded-2xl px-4 py-3 backdrop-blur border border-white/10 text-center">
      <p className="opacity-80">Total Earnings</p>
      <p className="mt-1 font-semibold">
        ₹{wallet?.total_earnings?.toLocaleString()}
      </p>
    </div>
  </div>
)}

          {/* breakdown pills */}
          {showDetails && (
            <div className="mt-3">
              <div className="mb-2 text-[11px] uppercase tracking-[0.18em] opacity-75">
                Breakdown
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'deposited', label: 'Deposited', value: wallet?.total_deposited },
                  { id: 'invested', label: 'Invested', value: wallet?.total_invested },
                  { id: 'earnings', label: 'Earnings', value: wallet?.total_earnings },
                  { id: 'withdrawn', label: 'Withdrawn', value: wallet?.total_withdrawn },
                ].map((item) => {
                  const isActive = activeFilter === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        setActiveFilter((prev) => (prev === item.id ? 'all' : item.id))
                      }
                      className={`
                        text-left rounded-2xl px-4 py-3 
                        backdrop-blur-md 
                        border 
                        transition-all duration-200
                        ${
                          isActive
                            ? 'bg-white/95 text-slate-900 border-transparent shadow-[0_10px_30px_rgba(0,0,0,0.45)] scale-[1.02]'
                            : 'bg-black/25 text-white border-white/18 hover:bg-black/40'
                        }
                      `}
                    >
                      <p className="text-[11px] opacity-80">{item.label}</p>
                      <p className="mt-1 text-lg font-semibold">
                        ₹{item.value?.toLocaleString() || 0}
                      </p>
                      {isActive && (
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-700">
                          Filter applied
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="mt-4 flex flex-col md:flex-row gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="
                flex-1 rounded-2xl 
                bg-white text-slate-900 
                py-3 md:py-3.5 px-6 
                font-semibold text-sm md:text-base 
                shadow-[0_10px_30px_rgba(0,0,0,0.45)] 
                hover:bg-slate-50 
                active:scale-[0.985]
                transition-all duration-200
              "
            >
              + Deposit
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="
                flex-1 rounded-2xl 
                border border-white/35 
                bg-white/10 text-white 
                py-3 md:py-3.5 px-6 
                font-semibold text-sm md:text-base 
                backdrop-blur 
                hover:bg-white/18 
                active:scale-[0.985]
                transition-all duration-200
              "
            >
              Withdraw
            </button>
          </div>

          {/* SHOW TRANSACTIONS TOGGLE */}
          <button
            onClick={() => setShowTransactions((prev) => !prev)}
            className="
              mt-4 w-full text-center py-3 
              rounded-2xl 
              bg-black/35 
              backdrop-blur 
              border border-white/20 
              text-sm 
              hover:bg-black/50
              transition-all duration-200
            "
          >
            {showTransactions ? 'Hide Transactions ▴' : 'Show Transactions ▾'}
          </button>
        </div>
      </div>

      {/* TRANSACTIONS SECTION (togglable) */}
      {showTransactions && (
        <div
          className="
            w-full max-w-5xl
            translate-x-28
            bg-[var(--fb-surface)]/92 
            border border-[var(--fb-border)] 
            rounded-[26px] 
            shadow-[0_18px_55px_rgba(0,0,0,0.75)] 
            p-6 md:p-7 
            animate-[fadeIn_0.45s_ease-out]
          "
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-semibold">Recent activity</h3>
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                {activeFilter === 'all'
                  ? 'Last 10 wallet transactions'
                  : `Filtered by: ${activeFilter}`}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {['all', 'deposited', 'invested', 'earnings', 'withdrawn'].map((id) => (
                <button
                  key={id}
                  onClick={() => setActiveFilter(id)}
                  className={`
                    px-3 py-1.5 rounded-full border text-xs transition-all duration-200
                    ${
                      activeFilter === id
                        ? 'bg-[var(--fb-pink)] text-white border-transparent shadow-[0_8px_22px_rgba(0,0,0,0.65)]'
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800/70'
                    }
                  `}
                >
                  {id === 'all' ? 'All' : id.charAt(0).toUpperCase() + id.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              No transactions found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="
                    flex items-center justify-between 
                    p-4 rounded-2xl 
                    bg-black/45 
                    border border-white/6
                    hover:bg-black/60
                    transition-all duration-200
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{getTransactionIcon(tx.transaction_type)}</div>
                    <div>
                      <p className="font-semibold capitalize text-sm md:text-base">
                        {tx.transaction_type}
                      </p>
                      {tx.description && (
                        <p className="text-xs md:text-sm text-gray-400">
                          {tx.description}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-500 mt-1">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className={`
                        text-sm md:text-lg font-bold 
                        ${getTransactionColor(tx.transaction_type)}
                      `}
                    >
                      {['deposit', 'payout'].includes(tx.transaction_type) ? '+' : '-'}
                      ₹{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-[11px] md:text-xs text-gray-400">
                      Balance: ₹{tx.balance_after.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Deposit Modal */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onSuccess={handleDepositSuccess}
      />

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--fb-surface)]/98 text-white rounded-2xl p-8 max-w-md w-full border border-[var(--fb-border)] shadow-[0_18px_55px_rgba(0,0,0,0.9)]">
            <h3 className="text-xl md:text-2xl font-bold mb-6">Withdraw Money</h3>
            <form onSubmit={handleWithdraw}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="
                    w-full p-3 rounded-xl 
                    bg-black/45 
                    border border-[var(--fb-border)] 
                    text-white 
                    focus:outline-none 
                    focus:ring-2 
                    focus:ring-[var(--fb-pink)]
                  "
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setAmount('');
                  }}
                  className="
                    flex-1 px-6 py-3 rounded-xl 
                    border border-gray-600 
                    text-gray-200 
                    hover:bg-gray-800/70 
                    transition-all duration-200 text-sm
                  "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="
                    flex-1 bg-[var(--fb-pink)] 
                    text-white px-6 py-3 rounded-xl 
                    font-semibold 
                    hover:opacity-90 
                    disabled:opacity-50 
                    transition-all duration-200 text-sm
                  "
                >
                  {processing ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDashboard;

import React, { useState, useEffect } from 'react';
import walletService from '../../services/walletService';

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

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, transRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(1, 10)
      ]);
      if (balanceRes.success) setWallet(balanceRes.data);
      if (transRes.success) setTransactions(transRes.data.transactions);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      setProcessing(true);
      setError('');
      const response = await walletService.deposit(amount);
      if (response.success) {
        setSuccess(`Successfully deposited ₹${amount}`);
        setAmount('');
        setShowDepositModal(false);
        fetchWalletData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Deposit failed');
    } finally {
      setProcessing(false);
    }
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
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Withdrawal failed');
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type) => {
    const icons = { deposit: '💰', withdraw: '🏦', investment: '📈', payout: '💸' };
    return icons[type] || '📝';
  };

  const getTransactionColor = (type) => {
    const colors = { deposit: 'text-green-600', withdraw: 'text-red-600', investment: 'text-blue-600', payout: 'text-green-600' };
    return colors[type] || 'text-gray-600';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">{success}</div>}

      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <h2 className="text-lg font-medium opacity-90 mb-2">Total Balance</h2>
        <div className="text-5xl font-bold mb-6">₹{wallet?.balance?.toLocaleString() || '0'}</div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <p className="text-sm opacity-80">Deposited</p>
            <p className="text-xl font-semibold">₹{wallet?.total_deposited?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Invested</p>
            <p className="text-xl font-semibold">₹{wallet?.total_invested?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Earnings</p>
            <p className="text-xl font-semibold">₹{wallet?.total_earnings?.toLocaleString() || '0'}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Withdrawn</p>
            <p className="text-xl font-semibold">₹{wallet?.total_withdrawn?.toLocaleString() || '0'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShowDepositModal(true)} className="flex-1 bg-white text-blue-600 py-3 px-6 rounded-xl font-semibold hover:bg-gray-100 transition">
            + Deposit
          </button>
          <button onClick={() => setShowWithdrawModal(true)} className="flex-1 bg-white/20 backdrop-blur py-3 px-6 rounded-xl font-semibold hover:bg-white/30 transition">
            Withdraw
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-6">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{getTransactionIcon(tx.transaction_type)}</div>
                  <div>
                    <p className="font-semibold capitalize">{tx.transaction_type}</p>
                    <p className="text-sm text-gray-600">{tx.description}</p>
                    <p className="text-xs text-gray-400">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${getTransactionColor(tx.transaction_type)}`}>
                    {['deposit', 'payout'].includes(tx.transaction_type) ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Balance: ₹{tx.balance_after.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Deposit Money</h3>
            <form onSubmit={handleDeposit}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter amount" required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setShowDepositModal(false); setAmount(''); }} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={processing} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {processing ? 'Processing...' : 'Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Withdraw Money</h3>
            <form onSubmit={handleWithdraw}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Enter amount" required />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => { setShowWithdrawModal(false); setAmount(''); }} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={processing} className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50">
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
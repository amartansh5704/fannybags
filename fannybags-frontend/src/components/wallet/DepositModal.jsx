import React, { useState, useEffect } from 'react';
import { FiX, FiDollarSign, FiCreditCard, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { initiateDeposit, processDeposit, getPaymentMethods } from '../../services/paymentService';
import ClickSpark from '../reactbits/animations/ClickSpark';

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('input'); // input, processing, success, error
  const [error, setError] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('upi');
  const [paymentMode, setPaymentMode] = useState('mock');

  // Predefined amounts for quick selection
  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  // Fetch payment methods on mount
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const data = await getPaymentMethods();
      setPaymentMethods(data.methods || []);
      setPaymentMode(data.mode || 'mock');
    } catch (err) {
      console.error('Failed to fetch payment methods:', err);
    }
  };

  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount.toString());
    setError(null);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
      setError(null);
    }
  };

  const validateAmount = () => {
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return false;
    }

    if (numAmount < 100) {
      setError('Minimum deposit amount is ₹100');
      return false;
    }

    if (numAmount > 100000) {
      setError('Maximum deposit amount is ₹1,00,000');
      return false;
    }

    return true;
  };

  const handleDeposit = async () => {
    // Validate amount
    if (!validateAmount()) {
      return;
    }

    setProcessing(true);
    setError(null);
    setStep('processing');

    try {
      // Step 1: Initiate deposit
      const initiateResponse = await initiateDeposit(parseFloat(amount));

      if (!initiateResponse.success) {
        throw new Error(initiateResponse.message || 'Failed to initiate deposit');
      }

      const txnId = initiateResponse.data.transaction_id;
      setTransactionId(txnId);

      // Step 2: Process payment (simulate gateway)
      const processResponse = await processDeposit(txnId);

      if (!processResponse.success) {
        setStep('error');
        setError(processResponse.message || 'Payment failed');
        setProcessing(false);
        return;
      }

      // Step 3: Success!
      setStep('success');
      setProcessing(false);

      // Call success callback with new balance
      if (onSuccess) {
        onSuccess(processResponse.data);
      }

    } catch (err) {
      console.error('Deposit failed:', err);
      setStep('error');
      setError(err.response?.data?.error || err.message || 'Payment processing failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      // Reset state
      setAmount('');
      setStep('input');
      setError(null);
      setTransactionId(null);
      onClose();
    }
  };

  const handleTryAgain = () => {
    setStep('input');
    setError(null);
    setTransactionId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <FiDollarSign className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Add Money to Wallet</h2>
              {paymentMode === 'mock' && (
                <p className="text-xs text-white text-opacity-80">Mock Payment Mode (Testing)</p>
              )}
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={processing}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* STEP 1: Input Amount */}
          {step === 'input' && (
            <>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-xl font-bold">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    disabled={processing}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Min: ₹100 | Max: ₹1,00,000
                </p>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => handleQuickAmount(quickAmount)}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                        amount === quickAmount.toString()
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      ₹{quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      disabled={!method.enabled}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        selectedMethod === method.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!method.enabled && 'opacity-50 cursor-not-allowed'}`}
                    >
                      <span className="text-2xl">{method.icon}</span>
                      <span className="text-sm font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <FiAlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={18} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <ClickSpark sparkColor="#12CE6A" sparkRadius={25} sparkCount={12}>
  <button
    onClick={handleDeposit}
    disabled={!amount || processing}
    className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Continue
  </button>
</ClickSpark>
              </div>
            </>
          )}

          {/* STEP 2: Processing */}
          {step === 'processing' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
                <FiLoader className="text-purple-600 animate-spin" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Processing Payment...
              </h3>
              <p className="text-gray-600 mb-4">
                Please wait while we process your payment
              </p>
              <div className="max-w-xs mx-auto">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-600 to-pink-600 animate-pulse" style={{ width: '70%' }}></div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Transaction ID: {transactionId}
              </p>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === 'success' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <FiCheckCircle className="text-green-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Deposit Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                ₹{parseFloat(amount).toLocaleString()} has been added to your wallet
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                <p className="font-mono text-sm text-gray-700">{transactionId}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Done
              </button>
            </div>
          )}

          {/* STEP 4: Error */}
          {step === 'error' && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
                <FiAlertCircle className="text-red-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {error || 'Something went wrong. Please try again.'}
              </p>
              {transactionId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-700">{transactionId}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleTryAgain}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
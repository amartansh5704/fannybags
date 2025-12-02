import React, { useState, useEffect } from "react";
import { FiX, FiCheckCircle, FiAlertCircle, FiLoader } from "react-icons/fi";
import { 
  initiateDeposit, 
  processDeposit, 
  getPaymentMethods,
  initiateRazorpayPayment,          // ⭐ ADDED
  isRazorpayLoaded                  // ⭐ ADDED
} from "../../services/paymentService";
import ClickSpark from "../reactbits/animations/ClickSpark";

const DepositModal = ({ isOpen, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState("input");
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState("upi");

  const [paymentMode, setPaymentMode] = useState("mock");  // ⭐ ADDED for Razorpay mode
  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();

      // ⭐ Check Razorpay availability
      if (isRazorpayLoaded()) {
        setPaymentMode("razorpay");
      } else {
        setPaymentMode("mock");
      }
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      const data = await getPaymentMethods();
      setPaymentMethods(data.methods || []);
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
    }
  };

  const validateAmount = () => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num)) return setError("Enter a valid amount"), false;
    if (num < 100) return setError("Minimum deposit is ₹100"), false;
    if (num > 100000) return setError("Maximum deposit is ₹1,00,000"), false;
    setError(null);
    return true;
  };

  // ⭐ NEW — Handle Razorpay flow
  const handleRazorpayDeposit = async () => {
    if (!validateAmount()) return;

    setProcessing(true);
    setStep("processing");

    try {
      const result = await initiateRazorpayPayment(parseFloat(amount), {
        paymentType: "wallet_deposit",
        description: `Add ₹${amount} to Wallet`,
        themeColor: "#3B82F6"
      });

      if (result.success) {
        setStep("success");
        setProcessing(false);
        onSuccess && onSuccess(result);
      }
    } catch (err) {
      console.log("Razorpay Error:", err);

      if (err.dismissed) {
        setStep("input");
        setError(null);
      } else {
        setStep("error");
        setError(err.message || "Payment failed");
      }

      setProcessing(false);
    }
  };

  // MOCK deposit (existing)
  const handleMockDeposit = async () => {
    if (!validateAmount()) return;

    setProcessing(true);
    setStep("processing");

    try {
      const init = await initiateDeposit(parseFloat(amount));
      if (!init.success) throw new Error(init.message);

      const proc = await processDeposit(init.data.transaction_id);
      if (!proc.success) {
        setStep("error");
        setError(proc.message);
        setProcessing(false);
        return;
      }

      setStep("success");
      setProcessing(false);
      onSuccess && onSuccess(proc.data);
    } catch (err) {
      setStep("error");
      setError(err.response?.data?.error || err.message);
      setProcessing(false);
    }
  };

  // ⭐ Decide between Razorpay or mock
  const handleDeposit = async () => {
    if (!validateAmount()) return;

    if (paymentMode === "razorpay" && isRazorpayLoaded()) {
      return handleRazorpayDeposit(); // ⭐ LIVE FLOW
    } else {
      return handleMockDeposit();     // ⭐ MOCK FLOW
    }
  };

  const handleClose = () => {
    if (processing) return;
    setAmount("");
    setStep("input");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">

      {/* GLASS CARD */}
      <div
        className="
          w-full max-w-md 
          rounded-3xl 
          bg-white/10 
          backdrop-blur-2xl 
          border border-white/20 
          shadow-[0_0_45px_rgba(0,0,0,0.6)]
          overflow-hidden
          animate-[fadeIn_0.3s_ease-out]
        "
      >

        {/* HEADER — CENTERED TITLE */}
        <div className="relative px-6 py-4 border-b border-white/10 bg-white/5 flex justify-center">
          <h2 className="text-lg font-semibold text-white tracking-wide drop-shadow-sm">
            Add Money
          </h2>

          {/* Close Button — positioned right */}
          <button
            onClick={handleClose}
            disabled={processing}
            className="
              absolute right-6 top-1/2 -translate-y-1/2 
              p-2 text-white rounded-xl 
              hover:bg-white/20 transition 
              disabled:opacity-40
            "
          >
            <FiX size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="px-6 py-6 text-white">
          {step === "input" && (
            <>
              {/* AMOUNT INPUT */}
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">
                  Enter Amount (₹)
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-2xl">
                    
                  </span>

                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => /^\d*$/.test(e.target.value) && setAmount(e.target.value)}
                    placeholder="0"
                    className="
                      w-full py-4 px-12 
                      rounded-2xl 
                      bg-white/10 
                      border border-white/20 
                      text-2xl font-semibold
                      placeholder-white/30
                      focus:ring-2 focus:ring-white/40
                      outline-none
                    "
                  />
                </div>

                <p className="text-xs text-white/50 mt-2">
                  Min ₹100 · Max ₹1,00,000
                </p>
              </div>

              {/* QUICK SELECT */}
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">
                  Quick Select
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      onClick={() => setAmount(q.toString())}
                      className={`
                        py-3 rounded-xl text-sm font-medium transition border
                        ${
                          amount == q
                            ? "bg-blue-500/30 border-blue-400/50 shadow-[0_0_12px_rgba(80,180,255,0.5)]"
                            : "bg-white/10 border-white/20 hover:bg-white/20"
                        }
                      `}
                    >
                      ₹{q}
                    </button>
                  ))}
                </div>
              </div>

              {/* PAYMENT METHODS */}
              <div className="mb-6">
                <label className="block text-sm text-white/70 mb-2">
                  Payment Method
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method.id)}
                      disabled={!method.enabled}
                      className={`
                        p-3 rounded-xl border transition backdrop-blur-xl
                        ${
                          selectedMethod === method.id
                            ? "bg-blue-500/25 border-blue-400/40 text-white shadow-[0_0_12px_rgba(80,180,255,0.4)]"
                            : "bg-white/10 border-white/20 hover:bg-white/20"
                        }
                        ${!method.enabled && "opacity-40 cursor-not-allowed"}
                      `}
                    >
                      {method.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-300/30 flex gap-2">
                  <FiAlertCircle size={18} className="text-red-300" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="
                    flex-1 py-3 rounded-xl 
                    bg-white/10 border border-white/20 
                    text-white hover:bg-white/20 transition
                  "
                >
                  Cancel
                </button>

                <ClickSpark sparkColor="#ffffff" sparkRadius={18} sparkCount={10}>
                  <button
                    onClick={handleDeposit}
                    disabled={!amount || processing}
                    className="
                      flex-1 py-3 rounded-xl 
                      bg-blue-500/30 border border-blue-400/40 
                      text-white font-semibold 
                      hover:bg-blue-500/40 
                      disabled:opacity-30 
                      transition
                    "
                  >
                    Continue
                  </button>
                </ClickSpark>
              </div>
            </>
          )}

          {/* PROCESSING */}
          {step === "processing" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                <FiLoader size={36} className="text-white animate-spin" />
              </div>
              <p className="text-lg font-semibold text-white">Processing...</p>
            </div>
          )}

          {/* SUCCESS */}
          {step === "success" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-400/20 border border-green-300/30 flex items-center justify-center">
                <FiCheckCircle size={40} className="text-green-300" />
              </div>

              <h3 className="text-xl font-bold text-white">Deposit Successful</h3>

              <button
                onClick={handleClose}
                className="
                  w-full mt-6 py-3 rounded-xl 
                  bg-white/20 border border-white/30 
                  text-white hover:bg-white/30 transition
                "
              >
                Done
              </button>
            </div>
          )}

          {/* ERROR */}
          {step === "error" && (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-300/30 flex items-center justify-center">
                <FiAlertCircle size={40} className="text-red-300" />
              </div>

              <h3 className="text-xl font-bold text-red-300">Payment Failed</h3>
              <p className="text-white/70 mt-3">{error}</p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleClose}
                  className="
                    flex-1 py-3 rounded-xl 
                    bg-white/10 border border-white/20 
                    text-white hover:bg-white/20 transition
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={() => setStep("input")}
                  className="
                    flex-1 py-3 rounded-xl 
                    bg-white/20 border border-white/30 
                    text-white font-semibold 
                    hover:bg-white/30 transition
                  "
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

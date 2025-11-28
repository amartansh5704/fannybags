import { IoTrendingUp, IoCalendarOutline, IoCheckmarkCircle } from 'react-icons/io5';

export default function PayoutHistory({ transactions = [] }) {
  // ✅ Using EXACT original filter logic
  const payouts = transactions.filter(t => 
    t?.transaction_type === 'payout' || 
    t?.type === 'payout' ||
    t?.type === 'revenue_distribution'
  );

  if (payouts.length === 0) {
    return (
      <div
        className="rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.97))',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(148,163,184,0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
        }}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
          <IoTrendingUp className="text-gray-500 text-2xl" />
        </div>
        <p className="text-gray-400 text-sm font-semibold mb-2">💸 No Payouts Yet</p>
        <p className="text-gray-500 text-xs">
          Earnings will show here once revenue is distributed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          💸 Payout History
        </h3>
        <span className="text-sm text-gray-400">
          {payouts.length} payout{payouts.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Timeline Container */}
      <div
        className="rounded-3xl p-6 space-y-3"
        style={{
          background: 'radial-gradient(circle at 0% 0%, rgba(34,197,94,0.08) 0%, transparent 60%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.97))',
          backdropFilter: 'blur(32px)',
          border: '1px solid rgba(34,197,94,0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(34,197,94,0.1)'
        }}
      >
        {payouts.map((payout, index) => {
          // ✅ Safe defaults
          const amount = payout?.amount || 0;
          const date = payout?.created_at ? new Date(payout.created_at) : new Date();
          const description = payout?.description || 'Revenue Distribution';
          const status = payout?.status || 'completed';

          return (
            <div
              key={payout?.id || index}
              className="relative group"
            >
              {/* Transaction Card */}
              <div
                className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-white/5"
                style={{
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                
                {/* Left: Date + Icon */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(16,185,129,0.2))',
                      border: '1px solid rgba(34,197,94,0.4)',
                      boxShadow: '0 0 15px rgba(34,197,94,0.2)'
                    }}
                  >
                    <IoCheckmarkCircle className="text-emerald-400 text-lg" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <IoCalendarOutline className="text-gray-500 text-xs" />
                      <p className="text-xs text-gray-400">
                        📅 {date.toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-300 truncate max-w-xs">
                      {description}
                    </p>
                  </div>
                </div>

                {/* Right: Amount + Status */}
                <div className="text-right">
                  <p
                    className="text-xl font-black tracking-tight mb-1"
                    style={{
                      background: 'linear-gradient(135deg, #22C55E, #6EE7B7)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    +₹{amount.toFixed(0)}
                  </p>
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                    style={{
                      background: 'rgba(34,197,94,0.2)',
                      color: '#6EE7B7',
                      border: '1px solid rgba(34,197,94,0.4)'
                    }}
                  >
                    {status}
                  </span>
                </div>
              </div>

              {/* Connector Line (except last item) */}
              {index < payouts.length - 1 && (
                <div className="ml-[22px] my-1 w-0.5 h-4 bg-gradient-to-b from-emerald-500/30 to-transparent" />
              )}
            </div>
          );
        })}
      </div>

      {/* Total Earnings Summary */}
      <div
        className="rounded-2xl p-5 mt-4"
        style={{
          background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.2)'
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-300 font-medium">Total Payouts Received</span>
          <span className="text-2xl font-black text-emerald-300">
            ₹{payouts.reduce((sum, p) => sum + (p?.amount || 0), 0).toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
}
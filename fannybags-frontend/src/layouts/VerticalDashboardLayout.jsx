// src/layouts/VerticalDashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import VerticalSidebar from '../components/common/VerticalSidebar';
import { useAuthStore } from '../store/authStore';
import { IoWallet } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import walletService from '../services/walletService';

export default function VerticalDashboardLayout() {
  const { user } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'investor') {
      setLoading(true);
      walletService.getBalance()
        .then(response => {
          console.log('Raw wallet response:', response);
          
          // Handle different possible response structures
          let balance = 0;
          
          if (response.success && response.data?.balance !== undefined) {
            // Structure: { success: true, data: { balance: 5000 } }
            balance = response.data.balance;
          } else if (response.balance !== undefined) {
            // Structure: { balance: 5000 }
            balance = response.balance;
          } else if (response.data?.balance !== undefined) {
            // Structure: { data: { balance: 5000 } }
            balance = response.data.balance;
          }
          
          setWalletBalance(balance);
          console.log('Wallet balance set to:', balance);
        })
        .catch(err => {
          console.error('Failed to fetch wallet balance:', err);
          setWalletBalance(0);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-transparent text-white">
      {/* Sidebar */}
      <VerticalSidebar />

      {/* Main Content Area */}
      <div className="ml-60 min-h-screen">
        {/* Top Bar with Wallet - Minimal */}
        {user?.role === 'investor' && (
          <div 
            className="sticky top-0 z-30 backdrop-blur-xl px-6 py-3"
            style={{
              background: 'rgba(10, 10, 10, 0.4)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.03)'
            }}
          >
            <div className="flex justify-between items-center">
              <h1 
                className="text-lg font-normal tracking-tight text-gray-300" 
                style={{ 
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif',
                  letterSpacing: '-0.01em'
                }}
              >
                Dashboard
              </h1>
              
              <div 
                className="flex items-center gap-3 px-5 py-2.5 rounded-lg backdrop-blur-sm transition-all"
                style={{
                  background: 'rgba(255, 72, 185, 0.05)',
                  border: '1px solid transparent'
                }}
              >
                <IoWallet className="text-[#FF48B9] text-lg" />
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wider font-normal">
                    Balance
                  </span>
                  {loading ? (
                    <span className="text-lg font-light text-gray-400">Loading...</span>
                  ) : (
                    <span 
                      className="text-lg font-light text-white tracking-tight"
                      style={{ 
                        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Inter", sans-serif',
                        fontVariantNumeric: 'tabular-nums',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      ₹{walletBalance.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content - Transparent Background */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
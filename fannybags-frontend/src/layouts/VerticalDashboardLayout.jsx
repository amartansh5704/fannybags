// src/layouts/VerticalDashboardLayout.jsx
import { Outlet } from 'react-router-dom';
import VerticalSidebar from '../components/common/VerticalSidebar';
import { useAuthStore } from '../store/authStore';
import { IoWallet } from 'react-icons/io5';
import { useEffect, useState } from 'react';
import walletService from '../services/walletService'; // 🔥 FIXED: Changed to default import

export default function VerticalDashboardLayout() {
  const { user } = useAuthStore();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'investor') {
      setLoading(true);
      walletService.getBalance() // 🔥 FIXED: Changed from getWalletDetails() to getBalance()
        .then(data => {
          console.log('Wallet balance fetched:', data);
          // Backend returns { success: true, balance: 5000, ... }
          setWalletBalance(data.balance || 0);
        })
        .catch(err => {
          console.error('Failed to fetch wallet:', err);
          setWalletBalance(0); // Fallback to 0 on error
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Sidebar */}
      <VerticalSidebar />

      {/* Main Content Area */}
      <div className="ml-60 min-h-screen">
        {/* Top Bar with Wallet */}
        {user?.role === 'investor' && (
          <div className="sticky top-0 z-30 bg-[rgba(10,10,10,0.8)] backdrop-blur-xl border-b border-[rgba(255,255,255,0.08)] px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-2 bg-[rgba(255,72,185,0.1)] border border-[rgba(255,72,185,0.3)] px-4 py-2 rounded-lg">
                <IoWallet className="text-[#FF48B9]" />
                <span className="text-sm text-gray-400">Balance:</span>
                {loading ? (
                  <span className="text-lg font-bold text-gray-400">Loading...</span>
                ) : (
                  <span className="text-lg font-bold text-white">₹{walletBalance.toLocaleString()}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
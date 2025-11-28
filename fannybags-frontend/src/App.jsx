import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/common/Navbar';
import Landing from './pages/landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CampaignBrowse from './pages/CampaignBrowse';
import CampaignDetail from './pages/CampaignDetail';
import CampaignDetailVertical from './pages/CampaignDetailVertical'; // 🔥 NEW
import ArtistProfile from './pages/ArtistProfile';
import WalletDashboard from './components/investor/WalletDashboard';
import EditArtistProfile from './pages/EditArtistProfile';
import VerticalDashboardLayout from './layouts/VerticalDashboardLayout';
import VerticalDashboard from './pages/VerticalDashboard';
import { Toaster } from 'react-hot-toast';
import GlobalClickSpark from './components/reactbits/animations/GlobalClickSpark';
import './styles/animations.css';
import './styles/vertical-layout.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <GlobalClickSpark 
        sparkColor="#12CE6A" 
        sparkRadius={35} 
        sparkCount={12} 
        duration={700}
        enabled={true}
      />
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        {/* Landing & Auth (with regular navbar) */}
        <Route path="/" element={<><Navbar /><Landing /></>} />
        <Route path="/login" element={<><Navbar /><Login /></>} />
        <Route path="/register" element={<><Navbar /><Register /></>} />
        
        {/* Old routes (backward compatible) */}
        <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
        <Route path="/campaigns" element={<><Navbar /><CampaignBrowse /></>} />
        <Route path="/campaign/:id" element={<><Navbar /><CampaignDetail /></>} />
        <Route path="/artist/:artistId" element={<><Navbar /><ArtistProfile /></>} />
        <Route path="/wallet" element={<><Navbar /><WalletDashboard /></>} />
        <Route path="/artist/edit-profile" element={<><Navbar /><EditArtistProfile /></>} />
        
        {/* 🔥 NEW: Vertical Dashboard Routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <VerticalDashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<VerticalDashboard />} />
          <Route path="explore" element={<CampaignBrowse />} />
          <Route path="wallet" element={<WalletDashboard />} />
          {/* 🔥 NEW: Vertical campaign detail route */}
          <Route path="campaign/:id" element={<CampaignDetailVertical />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
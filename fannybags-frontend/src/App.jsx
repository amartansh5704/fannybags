import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/common/Navbar';
import Landing from './pages/landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CampaignBrowse from './pages/CampaignBrowse';
import CampaignDetail from './pages/CampaignDetail';
import ArtistProfile from './pages/ArtistProfile';
import WalletDashboard from './components/investor/WalletDashboard';
import EditArtistProfile from './pages/EditArtistProfile';
import { Toaster } from 'react-hot-toast';
import GlobalClickSpark from './components/reactbits/animations/GlobalClickSpark';
import './styles/animations.css';

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
      <Navbar />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns" element={<CampaignBrowse />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/artist/:artistId" element={<ArtistProfile />} />
        <Route path="/wallet" element={<WalletDashboard />} />
        <Route path="/artist/edit-profile" element={<EditArtistProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
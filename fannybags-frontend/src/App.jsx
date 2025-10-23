import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Navbar from './components/common/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CampaignBrowse from './pages/CampaignBrowse';
import CampaignDetail from './pages/CampaignDetail';
import ArtistProfile from './pages/ArtistProfile';
import WalletDashboard from './components/investor/WalletDashboard';  // NEW LINE
import EditArtistProfile from './pages/EditArtistProfile'; // Add this line

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/campaigns" element={<CampaignBrowse />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/artist/:artistId" element={<ArtistProfile />} />
        <Route path="/wallet" element={<WalletDashboard />} />  {/* NEW LINE */}
        <Route path="/artist/edit-profile" element={<EditArtistProfile />} /> {/* Add this line */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
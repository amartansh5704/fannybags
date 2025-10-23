import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { artistService } from '../services/artistService'; // Using the new service

export default function ArtistProfile() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  // Single state for all artist data
  const [artist, setArtist] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  
  // Check if the logged-in user is viewing their own profile
  const isOwnProfile = isAuthenticated && user?.id === parseInt(artistId);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        // 🔥 Use the single, correct API endpoint
        const data = await artistService.getArtistProfile(artistId);
        setArtist(data); // This sets the artist, their stats, and their campaigns all at once
      } catch (err) {
        setError('Failed to load artist profile. The artist may not exist.');
        console.error("Artist Profile Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <div className="animate-pulse">Loading artist profile...</div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-6">{error || 'Artist not found'}</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2 bg-fb-pink text-white rounded hover:opacity-90 transition"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  // Filter campaigns based on the active tab
  const liveCampaigns = artist.campaigns?.filter(c => c.funding_status === 'live') || [];
  const completedCampaigns = artist.campaigns?.filter(c => c.funding_status === 'funded') || [];
  const draftCampaigns = artist.campaigns?.filter(c => c.funding_status === 'draft') || [];

  const displayedCampaigns = activeTab === 'live' ? liveCampaigns 
    : activeTab === 'completed' ? completedCampaigns 
    : draftCampaigns;

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-fb-purple/80 to-fb-pink/80 rounded-xl p-8 mb-8">
          <div className="absolute inset-0 bg-black/30 rounded-xl"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                {artist.profile_image_url ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${artist.profile_image_url}`}
                    alt={artist.name}
                    className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${artist.name.replace(/\s/g, '+')}&background=FF48B9&color=fff&size=200`;
                    }}
                  />
                ) : (
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-fb-pink flex items-center justify-center text-4xl font-bold border-4 border-white shadow-xl">
                    {artist.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Artist Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{artist.name}</h1>
                  {artist.verified && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">✓ Verified</span>
                  )}
                </div>
                <p className="text-lg mb-2">{artist.genre} • {artist.location}</p>
                <p className="text-white/80 mb-4 max-w-2xl">{artist.bio}</p>
                
                {/* Social Links */}
                <div className="flex gap-3 justify-center md:justify-start">
                  {artist.social_links?.spotify && <a href={artist.social_links.spotify} target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition" title="Spotify">🎵</a>}
                  {artist.social_links?.instagram && <a href={artist.social_links.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition" title="Instagram">📷</a>}
                  {artist.social_links?.youtube && <a href={artist.social_links.youtube} target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition" title="YouTube">📺</a>}
                  {artist.social_links?.twitter && <a href={artist.social_links.twitter} target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition" title="Twitter">🐦</a>}
                </div>
              </div>

              {/* Edit Button (if own profile) - MOVED HERE */}
{isOwnProfile && (
  <div className="mt-4">
    <button
      onClick={() => navigate('/artist/edit-profile')}
      className="bg-white/20 hover:bg-white/30 px-6 py-2 rounded-lg transition text-sm font-semibold"
    >
      ✏️ Edit Profile
    </button>
  </div>
)}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-fb-surface p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-fb-green">₹{artist.stats?.total_raised?.toLocaleString() || 0}</p>
            <p className="text-xs text-gray-400">Total Raised</p>
          </div>
          <div className="bg-fb-surface p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-fb-pink">{artist.stats?.total_investors || 0}</p>
            <p className="text-xs text-gray-400">Investors</p>
          </div>
          <div className="bg-fb-surface p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-blue-400">{artist.stats?.live_campaigns || 0}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div className="bg-fb-surface p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-400">{artist.stats?.funded_campaigns || 0}</p>
            <p className="text-xs text-gray-400">Funded</p>
          </div>
          <div className="bg-fb-surface p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-yellow-400">{artist.stats?.success_rate || 0}%</p>
            <p className="text-xs text-gray-400">Success Rate</p>
          </div>
          <div className="bg-fb-surface p-4 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-400">{artist.stats?.total_campaigns || 0}</p>
            <p className="text-xs text-gray-400">Campaigns</p>
          </div>
        </div>

        {/* Campaign Tabs */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6 border-b border-gray-700">
            <button onClick={() => setActiveTab('live')} className={`pb-3 px-2 transition ${activeTab === 'live' ? 'text-fb-pink border-b-2 border-fb-pink' : 'text-gray-400 hover:text-white'}`}>
              Live Campaigns ({liveCampaigns.length})
            </button>
            <button onClick={() => setActiveTab('completed')} className={`pb-3 px-2 transition ${activeTab === 'completed' ? 'text-fb-pink border-b-2 border-fb-pink' : 'text-gray-400 hover:text-white'}`}>
              Completed ({completedCampaigns.length})
            </button>
            {isOwnProfile && (
              <button onClick={() => setActiveTab('draft')} className={`pb-3 px-2 transition ${activeTab === 'draft' ? 'text-fb-pink border-b-2 border-fb-pink' : 'text-gray-400 hover:text-white'}`}>
                Drafts ({draftCampaigns.length})
              </button>
            )}
          </div>

          {/* Campaigns Grid */}
          {displayedCampaigns.length === 0 ? (
            <div className="bg-fb-surface p-8 rounded-lg text-center">
              <p className="text-gray-400">No {activeTab} campaigns to show.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCampaigns.map((campaign) => (
                <div key={campaign.id} className="bg-fb-surface rounded-lg overflow-hidden hover:transform hover:scale-105 transition">
                  {campaign.artwork_url ? (
                    <img src={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${campaign.artwork_url}`} alt={campaign.title} className="w-full h-48 object-cover"/>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-r from-fb-purple to-fb-pink flex items-center justify-center"><span className="text-5xl">🎵</span></div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm"><span className="text-gray-400">Raised:</span><span className="font-semibold">₹{campaign.amount_raised?.toLocaleString() || 0}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-400">Revenue Share:</span><span className="text-fb-pink">{campaign.revenue_share_pct}%</span></div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div className="bg-fb-green h-2 rounded-full" style={{ width: `${Math.min(campaign.progress_percentage || 0, 100)}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded capitalize ${campaign.funding_status === 'live' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{campaign.funding_status}</span>
                      <button onClick={() => navigate(`/campaigns/${campaign.id}`)} className="text-fb-pink hover:text-white text-sm font-semibold">View →</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm">
          Member since {artist.joined_date ? new Date(artist.joined_date).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}
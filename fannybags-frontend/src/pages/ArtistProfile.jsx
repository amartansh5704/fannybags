import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { artistService } from '../services/artistService';

export default function ArtistProfile() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [artist, setArtist] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('live');
  
  const isOwnProfile = isAuthenticated && user?.id === parseInt(artistId);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        const data = await artistService.getArtistProfile(artistId);
        setArtist(data);
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
      <div className="min-h-screen bg-transparent text-white pt-20 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading artist profile...</div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-transparent text-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-6 text-sm">{error || 'Artist not found'}</p>
          <button
            onClick={() => navigate('/campaigns')}
            className="px-6 py-2.5 bg-fb-pink text-white rounded-lg hover:opacity-90 transition text-sm font-normal"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const liveCampaigns = artist.campaigns?.filter(c => c.funding_status === 'live') || [];
  const completedCampaigns = artist.campaigns?.filter(c => c.funding_status === 'funded') || [];
  const draftCampaigns = artist.campaigns?.filter(c => c.funding_status === 'draft') || [];

  const displayedCampaigns = activeTab === 'live' ? liveCampaigns 
    : activeTab === 'completed' ? completedCampaigns 
    : draftCampaigns;

  return (
    <div className="min-h-screen bg-transparent text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", sans-serif', paddingTop: '7vh' }}>
      <div className="w-full px-8 py-6" style={{ minHeight: '93vh' }}>
        
        {/* Hero Section */}
        <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/5">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {artist.profile_image_url ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'}${artist.profile_image_url}`}
                  alt={artist.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-2xl object-cover border border-white/10 shadow-xl"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${artist.name.replace(/\s/g, '+')}&background=FF48B9&color=fff&size=200`;
                  }}
                />
              ) : (
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-fb-pink to-purple-600 flex items-center justify-center text-3xl font-light border border-white/10 shadow-xl">
                  {artist.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-medium tracking-tight" style={{ letterSpacing: '-0.02em' }}>
                  {artist.name}
                </h1>
                {artist.verified && (
                  <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/30">Verified</span>
                )}
              </div>
              <p className="text-sm text-gray-400 mb-3 font-normal">{artist.genre} • {artist.location}</p>
              <p className="text-gray-300 mb-4 max-w-2xl text-sm leading-relaxed font-light">{artist.bio}</p>
              
              {/* Social Links */}
              <div className="flex gap-2">
                {artist.social_links?.spotify && (
                  <a href={artist.social_links.spotify} target="_blank" rel="noopener noreferrer" 
                     className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition border border-white/5 text-sm" 
                     title="Spotify">🎵</a>
                )}
                {artist.social_links?.instagram && (
                  <a href={artist.social_links.instagram} target="_blank" rel="noopener noreferrer" 
                     className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition border border-white/5 text-sm" 
                     title="Instagram">📷</a>
                )}
                {artist.social_links?.youtube && (
                  <a href={artist.social_links.youtube} target="_blank" rel="noopener noreferrer" 
                     className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition border border-white/5 text-sm" 
                     title="YouTube">📺</a>
                )}
                {artist.social_links?.twitter && (
                  <a href={artist.social_links.twitter} target="_blank" rel="noopener noreferrer" 
                     className="bg-white/5 hover:bg-white/10 p-2 rounded-lg transition border border-white/5 text-sm" 
                     title="Twitter">🐦</a>
                )}
              </div>
            </div>

            {/* Edit Button */}
            {isOwnProfile && (
              <div className="flex-shrink-0">
                <button
                  onClick={() => navigate('/artist/edit-profile')}
                  className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition border border-white/10 text-sm font-normal"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
            <p className="text-xl font-light text-green-400 tracking-tight" style={{ 
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.02em'
            }}>
              ₹{artist.stats?.total_raised?.toLocaleString() || 0}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Total Raised</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
            <p className="text-xl font-light text-fb-pink tracking-tight" style={{ 
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {artist.stats?.total_investors || 0}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Investors</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
            <p className="text-xl font-light text-blue-400 tracking-tight" style={{ 
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {artist.stats?.live_campaigns || 0}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Active</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
            <p className="text-xl font-light text-green-400 tracking-tight" style={{ 
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {artist.stats?.funded_campaigns || 0}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Funded</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
            <p className="text-xl font-light text-yellow-400 tracking-tight" style={{ 
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {artist.stats?.success_rate || 0}%
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Success Rate</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl text-center border border-white/5">
            <p className="text-xl font-light text-purple-400 tracking-tight" style={{ 
              fontFamily: '"SF Pro Display", -apple-system, sans-serif',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {artist.stats?.total_campaigns || 0}
            </p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Campaigns</p>
          </div>
        </div>

        {/* Campaign Tabs */}
        <div className="mb-6">
          <div className="flex gap-6 mb-5 border-b border-white/5">
            <button 
              onClick={() => setActiveTab('live')} 
              className={`pb-3 text-sm font-normal transition ${
                activeTab === 'live' 
                  ? 'text-white border-b-2 border-fb-pink' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Live Campaigns ({liveCampaigns.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`pb-3 text-sm font-normal transition ${
                activeTab === 'completed' 
                  ? 'text-white border-b-2 border-fb-pink' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Completed ({completedCampaigns.length})
            </button>
            {isOwnProfile && (
              <button 
                onClick={() => setActiveTab('draft')} 
                className={`pb-3 text-sm font-normal transition ${
                  activeTab === 'draft' 
                    ? 'text-white border-b-2 border-fb-pink' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Drafts ({draftCampaigns.length})
              </button>
            )}
          </div>

          {/* Campaigns Grid */}
          {displayedCampaigns.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm p-12 rounded-xl text-center border border-white/5">
              <p className="text-gray-400 text-sm font-light">No {activeTab} campaigns to show.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCampaigns.map((campaign) => (
                <div 
                  key={campaign.id} 
                  className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition border border-white/5 hover:border-white/10"
                >
                  {campaign.artwork_url ? (
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL|| 'http://127.0.0.1:5000'}${campaign.artwork_url}`} 
                      alt={campaign.title} 
                      className="w-full h-44 object-cover"
                    />
                  ) : (
                    <div className="w-full h-44 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="text-base font-medium mb-3 tracking-tight" style={{ letterSpacing: '-0.01em' }}>
                      {campaign.title}
                    </h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-light">Raised</span>
                        <span className="font-normal" style={{ 
                          fontFamily: '"SF Pro Display", -apple-system, sans-serif',
                          fontVariantNumeric: 'tabular-nums'
                        }}>
                          ₹{campaign.amount_raised?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-light">Revenue Share</span>
                        <span className="text-fb-pink font-normal">{campaign.revenue_share_pct}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 mb-4">
                      <div 
                        className="bg-green-400 h-1.5 rounded-full transition-all" 
                        style={{ width: `${Math.min(campaign.progress_percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] px-2 py-1 rounded-lg font-medium uppercase tracking-wider ${
                        campaign.funding_status === 'live' 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                      }`}>
                        {campaign.funding_status}
                      </span>
                      <button 
                        onClick={() => navigate(`/campaigns/${campaign.id}`)} 
                        className="text-fb-pink hover:text-white text-sm font-normal transition"
                      >
                        View →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-center text-gray-500 text-xs font-light">
          Member since {artist.joined_date ? new Date(artist.joined_date).toLocaleDateString() : 'N/A'}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';

export default function ArtistProfile() {
  const { artistId } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        setLoading(true);
        
        // Fetch artist campaigns using the new public endpoint
        const artistCampaigns = await campaignService.getArtistCampaigns(artistId);
        
        // Calculate artist stats
        const totalRaised = artistCampaigns.reduce((sum, c) => sum + (c.amount_raised || 0), 0);
        const totalInvestors = artistCampaigns.reduce((sum, c) => sum + (c.number_of_investors || 0), 0);
        const activeCampaigns = artistCampaigns.filter(c => c.funding_status === 'live').length;
        const completedCampaigns = artistCampaigns.filter(c => c.funding_status === 'funded').length;
        
        setCampaigns(artistCampaigns);
        setStats({
          totalRaised,
          totalInvestors,
          activeCampaigns,
          completedCampaigns,
          totalCampaigns: artistCampaigns.length
        });
        
        // For now, we'll use a mock artist object
        // In a real app, you'd fetch this from /api/artists/:id
        setArtist({
          id: artistId,
          name: 'Artist Name', // This would come from the API
          bio: 'Talented musician with a passion for creating unique sounds...',
          genre: 'Hip-Hop',
          location: 'Mumbai, India',
          social_links: {
            instagram: 'https://instagram.com/artist',
            twitter: 'https://twitter.com/artist',
            youtube: 'https://youtube.com/artist'
          },
          profile_image: 'https://via.placeholder.com/200x200/FF48B9/FFFFFF?text=Artist',
          joined_date: '2024-01-15'
        });
        
      } catch (err) {
        setError('Failed to load artist profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, [artistId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-fb-dark text-white pt-20 flex items-center justify-center">
        <p>Loading artist profile...</p>
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

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/campaigns')}
          className="text-fb-pink hover:underline mb-6"
        >
          ← Back to Campaigns
        </button>

        {/* Artist Header */}
        <div className="bg-fb-surface rounded-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Artist Photo */}
            <div className="flex-shrink-0">
              <img
                src={artist.profile_image}
                alt={artist.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-fb-pink"
              />
            </div>

            {/* Artist Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
              <p className="text-fb-pink font-semibold mb-2">{artist.genre} • {artist.location}</p>
              <p className="text-gray-300 mb-4">{artist.bio}</p>
              
              {/* Social Links */}
              <div className="flex gap-4 mb-4">
                {artist.social_links.instagram && (
                  <a
                    href={artist.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fb-pink hover:text-white transition"
                  >
                    📷 Instagram
                  </a>
                )}
                {artist.social_links.twitter && (
                  <a
                    href={artist.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fb-pink hover:text-white transition"
                  >
                    🐦 Twitter
                  </a>
                )}
                {artist.social_links.youtube && (
                  <a
                    href={artist.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fb-pink hover:text-white transition"
                  >
                    🎥 YouTube
                  </a>
                )}
              </div>

              <p className="text-sm text-gray-400">
                Joined {new Date(artist.joined_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Artist Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-fb-surface p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-fb-green">₹{stats.totalRaised.toLocaleString()}</p>
              <p className="text-sm text-gray-400">Total Raised</p>
            </div>
            <div className="bg-fb-surface p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-fb-pink">{stats.totalInvestors}</p>
              <p className="text-sm text-gray-400">Investors</p>
            </div>
            <div className="bg-fb-surface p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.activeCampaigns}</p>
              <p className="text-sm text-gray-400">Active Campaigns</p>
            </div>
            <div className="bg-fb-surface p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.completedCampaigns}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
          </div>
        )}

        {/* Artist's Campaigns */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Campaigns by {artist.name}</h2>
          
          {campaigns.length === 0 ? (
            <div className="bg-fb-surface p-8 rounded-lg text-center">
              <p className="text-gray-400">No campaigns yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-fb-surface p-6 rounded-lg hover:bg-gray-800 transition">
                  <h3 className="text-lg font-semibold mb-2">{campaign.title}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Raised:</span>
                      <span className="text-sm font-semibold">₹{campaign.amount_raised.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Target:</span>
                      <span className="text-sm">₹{campaign.target_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Revenue Share:</span>
                      <span className="text-sm text-fb-pink">{campaign.revenue_share_pct}%</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-fb-green h-2 rounded-full"
                      style={{
                        width: `${(campaign.amount_raised / campaign.target_amount) * 100}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 capitalize">{campaign.funding_status}</span>
                    <button
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                      className="text-fb-pink hover:text-white text-sm font-semibold"
                    >
                      View Campaign →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { artistService } from '../services/artistService';

export default function EditArtistProfile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    genre: '',
    spotify_url: '',
    instagram_url: '',
    youtube_url: '',
    twitter_url: ''
  });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 🔥 Wait for user object to be available
    if (!isAuthenticated || !user) {
      if(!isAuthenticated) navigate('/login');
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await artistService.getMyProfile();
        setFormData({
          bio: profileData.bio || '',
          location: profileData.location || '',
          genre: profileData.genre || '',
          spotify_url: profileData.social_links?.spotify || '',
          instagram_url: profileData.social_links?.instagram || '',
          youtube_url: profileData.social_links?.youtube || '',
          twitter_url: profileData.social_links?.twitter || ''
        });
        if (profileData.profile_image_url) {
          setImagePreview(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}${profileData.profile_image_url}`);
        }
      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // First, update text data
      await artistService.updateProfile(formData);
      
      // Then, upload new profile image if selected
      if (profileImageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', profileImageFile);
        await artistService.uploadProfileImage(imageFormData);
      }
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/artist/${user.id}`);
      }, 1500);

    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // 🔥 Render loading state until user object is ready
  if (!user || loading) {
    return <div className="min-h-screen bg-fb-dark text-white pt-20 flex justify-center"><p>Loading profile...</p></div>;
  }

  return (
    <div className="min-h-screen bg-fb-dark text-white pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold mb-6">✏️ Edit Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-fb-surface p-8 rounded-lg">
          {error && <div className="p-3 bg-red-500/20 text-red-400 rounded">{error}</div>}
          {success && <div className="p-3 bg-green-500/20 text-green-400 rounded">{success}</div>}
          
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Picture</label>
            <div className="flex items-center gap-4">
              <img 
                // 🔥 SAFE VERSION of the avatar URL
                src={imagePreview || `https://ui-avatars.com/api/?name=${user?.name?.replace(/\s/g, '+') || 'A'}&background=FF48B9&color=fff&size=128`}
                alt="Profile preview"
                className="w-24 h-24 rounded-full object-cover"
              />
              <input type="file" id="profile-image-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
              <label htmlFor="profile-image-upload" className="cursor-pointer px-4 py-2 border border-gray-600 rounded-lg hover:bg-gray-700">
                Change Picture
              </label>
            </div>
          </div>
          
          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              placeholder="Tell everyone about yourself..."
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">Location</label>
              <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg" placeholder="e.g., Mumbai, India" />
            </div>
            {/* Genre */}
            <div>
              <label htmlFor="genre" className="block text-sm font-medium mb-2">Primary Genre</label>
              <input type="text" id="genre" name="genre" value={formData.genre} onChange={handleChange} className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg" placeholder="e.g., DHH, Indie Pop" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold border-t border-gray-700 pt-6">Social Links</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="spotify_url" className="block text-sm font-medium mb-2">Spotify URL</label>
              <input type="url" id="spotify_url" name="spotify_url" value={formData.spotify_url} onChange={handleChange} className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg" placeholder="https://open.spotify.com/artist/..." />
            </div>
            <div>
              <label htmlFor="instagram_url" className="block text-sm font-medium mb-2">Instagram URL</label>
              <input type="url" id="instagram_url" name="instagram_url" value={formData.instagram_url} onChange={handleChange} className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg" placeholder="https://instagram.com/..." />
            </div>
            <div>
              <label htmlFor="youtube_url" className="block text-sm font-medium mb-2">YouTube URL</label>
              <input type="url" id="youtube_url" name="youtube_url" value={formData.youtube_url} onChange={handleChange} className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg" placeholder="https://youtube.com/c/..." />
            </div>
            <div>
              <label htmlFor="twitter_url" className="block text-sm font-medium mb-2">Twitter/X URL</label>
              <input type="url" id="twitter_url" name="twitter_url" value={formData.twitter_url} onChange={handleChange} className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg" placeholder="https://x.com/..." />
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
            <button type="button" onClick={() => navigate(`/artist/${user.id}`)} className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="px-8 py-3 bg-fb-pink text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { campaignService } from '../../services/campaignService';

export default function CampaignWizard({ onSuccess }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [aiPrediction, setAiPrediction] = useState(null);
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkPreview, setArtworkPreview] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: '',
    description: '',
    genre: 'dhh',
    
    // Step 2: Funding Details
    target_amount: 20000,
    partition_price: 1000,
    revenue_share_pct: 40,
    
    // Step 3: Timeline & Expectations
    start_date: '',
    end_date: '',
    expected_streams_3m: 0,
    expected_revenue_3m: 0,
    sharing_term: '2 years',
    
    // AI Predictor Inputs
    marketing_budget: 10000,
    video_budget: 10000,
    artist_followers: 15000
  });

  const totalSteps = 4;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['start_date', 'end_date', 'genre', 'sharing_term'].includes(name) 
        ? value 
        : parseFloat(value) || value
    }));
  };

  // File upload handlers
  const handleArtworkChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArtworkFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setArtworkPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setAudioFileName(file.name);
    }
  };

  const handleAIPrediction = async () => {
    setPredictionLoading(true);
    try {
      const result = await campaignService.predictRevenue({
        genre: formData.genre,
        marketing_budget: formData.marketing_budget,
        video_budget: formData.video_budget,
        artist_followers: formData.artist_followers,
        revenue_share_pct: formData.revenue_share_pct
      });
      
      if (result.success) {
        setAiPrediction(result);
        // Auto-fill expected values
        setFormData(prev => ({
          ...prev,
          expected_streams_3m: result.prediction.total_streams_3m,
          expected_revenue_3m: result.prediction.gross_revenue_3m
        }));
      }
    } catch (err) {
      console.error('AI Prediction failed:', err);
    } finally {
      setPredictionLoading(false);
    }
  };

  const validateStep = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setError('Campaign title is required');
        return false;
      }
      if (!formData.genre) {
        setError('Please select a genre');
        return false;
      }
    }
    
    if (currentStep === 2) {
      if (formData.target_amount <= 0) {
        setError('Target amount must be greater than 0');
        return false;
      }
      if (formData.partition_price <= 0) {
        setError('Partition price must be greater than 0');
        return false;
      }
      if (formData.revenue_share_pct < 1 || formData.revenue_share_pct > 100) {
        setError('Revenue share must be between 1-100%');
        return false;
      }
    }
    
    if (currentStep === 3) {
      if (!formData.start_date || !formData.end_date) {
        setError('Start and end dates are required');
        return false;
      }
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      if (end <= start) {
        setError('End date must be after start date');
        return false;
      }
    }
    
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setError('');

    try {
      // First create the campaign
      const result = await campaignService.createCampaign(formData);
      const campaignId = result.campaign_id;
      
      // Then upload artwork if exists
      if (artworkFile) {
        const artworkFormData = new FormData();
        artworkFormData.append('file', artworkFile);
        await campaignService.uploadArtwork(campaignId, artworkFormData);
      }
      
      // Then upload audio if exists
      if (audioFile) {
        const audioFormData = new FormData();
        audioFormData.append('file', audioFile);
        await campaignService.uploadAudio(campaignId, audioFormData);
      }
      
      setSuccess(`Campaign "${result.title}" created successfully!`);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  const genreOptions = [
    { value: 'dhh', label: '🎤 DHH/Hip-Hop', desc: 'Desi Hip-Hop, Rap' },
    { value: 'indie pop', label: '🎸 Indie Pop', desc: 'Independent Pop Music' },
    { value: 'pop', label: '🎵 Pop', desc: 'Popular Music' },
    { value: 'indie', label: '🎹 Indie', desc: 'Independent Music' },
    { value: 'electronic', label: '🎧 Electronic', desc: 'EDM, House, Techno' },
    { value: 'rock', label: '🎸 Rock', desc: 'Rock & Alternative' },
    { value: 'bollywood', label: '🎬 Bollywood', desc: 'Film Music' },
    { value: 'punjabi', label: '🎺 Punjabi', desc: 'Punjabi Music' }
  ];

  return (
    <div className="bg-fb-surface rounded-lg p-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="flex-1 flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                ${currentStep >= step ? 'bg-fb-pink text-white' : 'bg-gray-700 text-gray-400'}
                transition-all duration-300
              `}>
                {step}
              </div>
              {step < 4 && (
                <div className={`
                  flex-1 h-1 mx-2
                  ${currentStep > step ? 'bg-fb-pink' : 'bg-gray-700'}
                  transition-all duration-300
                `}></div>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Basic Info</span>
          <span>Funding</span>
          <span>Timeline</span>
          <span>Review</span>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded text-green-400">
          {success}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6">📝 Basic Campaign Info</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              placeholder="My Awesome Song"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Genre *</label>
            <div className="grid md:grid-cols-2 gap-3">
              {genreOptions.map(genre => (
                <button
                  key={genre.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, genre: genre.value }))}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${formData.genre === genre.value 
                      ? 'border-fb-pink bg-fb-pink/10' 
                      : 'border-gray-700 hover:border-gray-600'}
                  `}
                >
                  <div className="font-semibold">{genre.label}</div>
                  <div className="text-xs text-gray-400">{genre.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              placeholder="Tell investors about your song..."
              rows="4"
            ></textarea>
          </div>

          {/* Artwork Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Artwork</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-fb-pink transition">
              {artworkPreview ? (
                <div className="relative">
                  <img src={artworkPreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setArtworkFile(null);
                      setArtworkPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-2">📷 Upload campaign artwork</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleArtworkChange}
                    className="hidden"
                    id="artwork-upload"
                  />
                  <label
                    htmlFor="artwork-upload"
                    className="cursor-pointer px-4 py-2 bg-fb-pink rounded inline-block hover:opacity-90"
                  >
                    Choose Image
                  </label>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF (Max 16MB)</p>
                </div>
              )}
            </div>
          </div>

          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Audio Preview (30 seconds)</label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-fb-pink transition">
              {audioFileName ? (
                <div className="flex items-center justify-between bg-fb-dark p-3 rounded">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎵</span>
                    <span className="text-sm">{audioFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAudioFile(null);
                      setAudioFileName('');
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-gray-400 mb-2">🎵 Upload audio preview</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioChange}
                    className="hidden"
                    id="audio-upload"
                  />
                  <label
                    htmlFor="audio-upload"
                    className="cursor-pointer px-4 py-2 bg-fb-pink rounded inline-block hover:opacity-90"
                  >
                    Choose Audio
                  </label>
                  <p className="text-xs text-gray-500 mt-2">MP3, WAV, M4A (Max 16MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}       

      {/* Step 2: Funding Details */}
      {currentStep === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6">💰 Funding Details</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Target Amount (₹) *</label>
              <input
                type="number"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              />
              <p className="text-xs text-gray-400 mt-1">Total funding goal</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Partition Price (₹) *</label>
              <input
                type="number"
                name="partition_price"
                value={formData.partition_price}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              />
              <p className="text-xs text-gray-400 mt-1">Price per share</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Revenue Share for Investors (%) *
            </label>
            <input
              type="number"
              name="revenue_share_pct"
              value={formData.revenue_share_pct}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
            />
            <div className="mt-2 p-3 bg-fb-dark rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Investors get:</span>
                <span className="font-bold text-fb-pink">{formData.revenue_share_pct}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">You keep:</span>
                <span className="font-bold text-fb-green">{95 - formData.revenue_share_pct}%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">*5% platform fee applies</div>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">Total Partitions</p>
                <p className="text-2xl font-bold text-fb-pink">
                  {Math.floor(formData.target_amount / formData.partition_price)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Minimum Investment</p>
                <p className="text-lg font-bold">₹{formData.partition_price}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Timeline & AI Prediction */}
      {currentStep === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6">📅 Timeline & Projections</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Start Date *</label>
              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Campaign End Date *</label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Revenue Sharing Term</label>
            <input
              type="text"
              name="sharing_term"
              value={formData.sharing_term}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              placeholder="e.g., 2 years"
            />
          </div>

          {/* AI Prediction Section */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30">
            <h3 className="text-xl font-bold mb-4">🤖 AI Revenue Prediction</h3>
            
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Marketing Budget (₹)</label>
                <input
                  type="number"
                  name="marketing_budget"
                  value={formData.marketing_budget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-fb-dark border border-gray-700 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Video Budget (₹)</label>
                <input
                  type="number"
                  name="video_budget"
                  value={formData.video_budget}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-fb-dark border border-gray-700 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Your Followers</label>
                <input
                  type="number"
                  name="artist_followers"
                  value={formData.artist_followers}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-fb-dark border border-gray-700 rounded text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAIPrediction}
              disabled={predictionLoading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {predictionLoading ? '🧠 Analyzing...' : '🚀 Get AI Prediction'}
            </button>

            {aiPrediction && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-fb-dark p-3 rounded">
                    <p className="text-xs text-gray-400">Expected Streams (3m)</p>
                    <p className="text-lg font-bold text-white">
                      {aiPrediction.prediction.total_streams_3m.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-fb-dark p-3 rounded">
                    <p className="text-xs text-gray-400">Expected Revenue (3m)</p>
                    <p className="text-lg font-bold text-fb-green">
                      ₹{aiPrediction.prediction.gross_revenue_3m.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-green-400">
                  ✅ Predictions auto-filled! You can edit them below if needed.
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Expected Streams (3 months)</label>
              <input
                type="number"
                name="expected_streams_3m"
                value={formData.expected_streams_3m}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Expected Revenue (₹) (3 months)</label>
              <input
                type="number"
                name="expected_revenue_3m"
                value={formData.expected_revenue_3m}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-fb-dark border border-gray-700 rounded-lg focus:outline-none focus:border-fb-pink"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-2xl font-bold mb-6">✅ Review & Publish</h2>
          
          <div className="space-y-4">
            {/* Basic Info Review */}
            <div className="bg-fb-dark p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-fb-pink">Basic Info</h3>
                <button onClick={() => setCurrentStep(1)} className="text-xs text-blue-400 hover:underline">
                  Edit
                </button>
              </div>
              <p className="text-lg font-semibold">{formData.title}</p>
              <p className="text-sm text-gray-400">Genre: {formData.genre}</p>
              {formData.description && (
                <p className="text-sm text-gray-400 mt-2">{formData.description}</p>
              )}
              {artworkPreview && (
                <img src={artworkPreview} alt="Campaign artwork" className="max-h-32 mt-2 rounded" />
              )}
              {audioFileName && (
                <p className="text-sm text-gray-400 mt-2">🎵 Audio: {audioFileName}</p>
              )}
            </div>

            {/* Funding Review */}
            <div className="bg-fb-dark p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-fb-pink">Funding Details</h3>
                <button onClick={() => setCurrentStep(2)} className="text-xs text-blue-400 hover:underline">
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Target Amount</p>
                  <p className="font-bold">₹{formData.target_amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Partition Price</p>
                  <p className="font-bold">₹{formData.partition_price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Revenue Share</p>
                  <p className="font-bold">{formData.revenue_share_pct}%</p>
                </div>
                <div>
                  <p className="text-gray-400">Total Partitions</p>
                  <p className="font-bold">{Math.floor(formData.target_amount / formData.partition_price)}</p>
                </div>
              </div>
            </div>

            {/* Timeline Review */}
            <div className="bg-fb-dark p-4 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-fb-pink">Timeline & Projections</h3>
                <button onClick={() => setCurrentStep(3)} className="text-xs text-blue-400 hover:underline">
                  Edit
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Start Date</p>
                  <p className="font-bold">{new Date(formData.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">End Date</p>
                  <p className="font-bold">{new Date(formData.end_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Expected Streams</p>
                  <p className="font-bold">{formData.expected_streams_3m.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400">Expected Revenue</p>
                  <p className="font-bold">₹{formData.expected_revenue_3m.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">⚠️ Before Publishing:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Campaign will be in "draft" status initially</li>
              <li>You can publish it from your dashboard</li>
              <li>Once live, investors can start funding</li>
            </ul>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-700">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 bg-gray-700 rounded-lg font-semibold hover:bg-gray-600 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            className="px-6 py-3 bg-fb-pink rounded-lg font-semibold hover:opacity-90 transition"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-fb-pink to-fb-purple rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : '🚀 Create Campaign'}
          </button>
        )}
      </div>
    </div>
  );
}
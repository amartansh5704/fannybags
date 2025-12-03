// ============================================
// PERFECT POSITIONING: No negative margins
// Using proper padding for sidebar spacing
// Dark, premium, music-app style polish
// ============================================
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignService } from '../services/campaignService';
import { useAuthStore } from '../store/authStore';
import InvestmentForm from '../components/campaigns/InvestmentForm';
import InvestmentHistory from '../components/campaigns/InvestmentHistory';
import CommentSection from '../components/campaigns/CommentSection';
import {
  IoShareSocial,
  IoMusicalNotes,
  IoCalendar,
  IoTrendingUp,
  IoPlay,
  IoPause
} from 'react-icons/io5';
import { FaFacebookF, FaTwitter } from 'react-icons/fa';
import ShareModal from '../components/common/ShareModal';
import StatusBadge from '../components/common/StatusBadge';

export default function CampaignDetailVertical() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [campaign, setCampaign] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showInvest, setShowInvest] = useState(false);
  const [showShare, setShowShare] = useState(false);

  // === NEW IMAGE PATH CONSTANTS ===
  const modelImage = "/images/model1.png";
  const campaignStartImage = "/images/campaignimg.png";
  const releaseDayImage = "/images/releasedayimg.png";
  const payoutImage = "/images/payoutimg.png";

  // 🎧 audio preview state
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // 🎚 partitions selector state (UI only)
  const [selectedPartitions, setSelectedPartitions] = useState(1);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        setLoading(true);
        const [campaignData, analyticsData] = await Promise.all([
          campaignService.getCampaignById(id),
          campaignService.getAnalytics(id).catch(() => null)
        ]);
        setCampaign(campaignData);
        setAnalytics(analyticsData);
      } catch (err) {
        setError('Failed to load campaign');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [id]);

  useEffect(() => {
    // keep UI in sync with audio element
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  const handleArtworkClick = () => {
    if (!campaign?.audio_preview_url) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Audio playback failed', err);
        });
    }
  };

  const handleInvestmentSuccess = async () => {
    try {
      const [campaignData, analyticsData] = await Promise.all([
        campaignService.getCampaignById(id),
        campaignService.getAnalytics(id).catch(() => null)
      ]);
      setCampaign(campaignData);
      setAnalytics(analyticsData);
      setShowInvest(false);
      alert('Investment successful!');
    } catch (err) {
      console.error('Error refreshing campaign data:', err);
      setShowInvest(false);
      alert('Investment successful, but failed to refresh data');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[#05030A]">
        <div></div>
        <div className="text-white flex items-center justify-center">
          <div className="text-center">
            <div
              className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FF48B9] mx-auto mb-4"
              style={{ boxShadow: '0 0 20px rgba(255,72,185,0.6)' }}
            ></div>
            <p className="text-gray-400 text-sm tracking-wide">
              Loading campaign...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="grid grid-cols-[240px_1fr] min-h-screen bg-[#05030A]">
        <div></div>
        <div className="text-white flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-6 text-sm font-medium">
              {error || 'Campaign not found'}
            </p>
            <button
              onClick={() => navigate('/app/explore')}
              className="px-6 py-2 bg-[#FF48B9] text-white rounded-lg hover:opacity-90 transition shadow-lg text-sm"
              style={{ boxShadow: '0 0 20px rgba(255,72,185,0.6)' }}
            >
              Back to Explore
            </button>
          </div>
        </div>
      </div>
    );
  }

  const partitionsSold = analytics?.partitions_sold || 0;
  const totalPartitions = campaign.total_partitions || 0;
  const availablePartitions = Math.max(0, totalPartitions - partitionsSold);
  const minPartitions = campaign.min_partitions_per_user || 1;
  const fundingPercentage =
    (campaign.amount_raised / campaign.target_amount) * 100;

  const artworkUrl = campaign.artwork_url
    ? `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'}${
        campaign.artwork_url
      }`
    : null;

  const getCampaignStatus = () => {
    if (campaign.funding_status === 'live') return 'active';
    if (campaign.funding_status === 'upcoming') return 'upcoming';
    if (campaign.funding_status === 'ended') return 'closed';
    if (campaign.funding_status === 'funded') return 'successful';
    return 'active';
  };

  const shareUrl = window.location.href;

  const totalPrice = campaign.partition_price * selectedPartitions;

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen relative overflow-hidden bg-[#05030A] text-white">
      {/* 🔥 Ambient gradient background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 15% 15%, rgba(255,72,185,0.18) 0%, transparent 55%),
            radial-gradient(circle at 80% 20%, rgba(139,92,246,0.18) 0%, transparent 55%),
            radial-gradient(circle at 20% 80%, rgba(18,206,106,0.15) 0%, transparent 55%),
            radial-gradient(circle at 85% 75%, rgba(72,149,239,0.15) 0%, transparent 55%),
            #05030A
          `,
          filter: 'blur(70px)',
          zIndex: 0
        }}
      />

      {artworkUrl && (
        <div
          className="fixed inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `url(${artworkUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(110px)',
            zIndex: 1
          }}
        />
      )}

      {/* SIDEBAR PLACEHOLDER (240px) */}
      <div></div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 pb-32 pl-10 pr-8 lg:pl-24">
        {/* HEADER / HERO CARD */}
        <div
          className="mb-6 mt-6 rounded-3xl border border-pink-500/40 shadow-[0_0_60px_rgba(255,72,185,0.35)] overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 0% 0%, rgba(255,72,185,0.35) 0, transparent 55%), radial-gradient(circle at 100% 0%, rgba(139,92,246,0.4) 0, transparent 55%), linear-gradient(135deg, rgba(10,6,26,0.95), rgba(9,9,20,0.98))',
            backdropFilter: 'blur(32px)'
          }}
        >
          <div className="p-6 md:p-8">
            
            {/* ⭐ NEW GRID LAYOUT: LEFT (text) + RIGHT (artwork) */}
            <div className="grid md:grid-cols-[1fr_auto] gap-6 mb-6 items-center">

              {/* LEFT SIDE — TEXT CONTENT */}
              <div className="flex flex-col gap-4">

                {/* Title */}
                <h1
                  className="text-4xl sm:text-5xl font-black leading-tight"
                  style={{
                    color: '#FF48B9',
                    textShadow:
                      '0 0 24px rgba(255,72,185,0.95), 0 0 60px rgba(255,72,185,0.65)',
                    letterSpacing: '0.08em'
                  }}
                >
                  {campaign.title}
                </h1>

                {/* Status + Genre + Revenue + Share */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={getCampaignStatus()} />

                    {campaign.genre && (
                      <span
                        className="px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-[0.16em]"
                        style={{
                          background: 'rgba(139,92,246,0.18)',
                          color: '#C4B5FD',
                          border: '1px solid rgba(139,92,246,0.55)',
                          boxShadow: '0 0 10px rgba(139,92,246,0.35)'
                        }}
                      >
                        {campaign.genre}
                      </span>
                    )}

                    <span
                      className="px-3 py-1 text-[11px] font-semibold rounded-full uppercase tracking-[0.16em]"
                      style={{
                        background: 'rgba(18,206,106,0.18)',
                        color: '#6EE7B7',
                        border: '1px solid rgba(16,185,129,0.6)',
                        boxShadow: '0 0 10px rgba(16,185,129,0.35)'
                      }}
                    >
                      {campaign.revenue_share_pct}% Revenue Share
                    </span>
                  </div>

                  <div className="md:ml-auto flex items-center gap-2 mt-2 md:mt-0">
                    <span className="text-xs text-gray-400">Share</span>
                    {[FaFacebookF, FaTwitter, IoShareSocial].map((Icon, i) => (
                      <button
                        key={i}
                        onClick={i === 2 ? () => setShowShare(true) : undefined}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition hover:scale-110 hover:bg-white/10 focus:outline-none focus:ring-[3px] focus:ring-pink-500/60"
                        style={{
                          background: 'rgba(15,23,42,0.65)',
                          border: '1px solid rgba(148,163,184,0.35)',
                          backdropFilter: 'blur(16px)'
                        }}
                      >
                        <Icon className="text-white text-xs" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300/90 text-sm leading-relaxed max-w-2xl">
                  {campaign.description}
                </p>

                {/* Subtle hint about audio */}
                {campaign.audio_preview_url && (
                  <p className="text-xs text-gray-400">
                    Tap the cover art to {isPlaying ? 'pause' : 'play'} the preview.
                  </p>
                )}

                {/* Artist profile (moved BELOW description) */}
                <button
                  onClick={() => navigate(`/artist/${campaign.artist_id}`)}
                  className="flex items-center gap-3 hover:opacity-90 transition group mt-2"
                >
                  <div
                    className="w-14 h-14 rounded-full p-[2px] shadow-[0_0_24px_rgba(255,72,185,0.7)]"
                    style={{
                      background: 'linear-gradient(135deg, #FF48B9 0%, #8B5CF6 100%)'
                    }}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center overflow-hidden bg-black/80">
                      {campaign.artist_profile_image ? (
                        <img
                          src={`${
                            import.meta.env.VITE_API_BASE_URL|| 'http://127.0.0.1:5000'
                          }${campaign.artist_profile_image}`}
                          alt={campaign.artist_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl">👤</span>
                      )}
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      Artist
                    </p>
                    <p className="text-sm font-semibold text-white group-hover:text-pink-200 transition">
                      {campaign.artist_name || 'Artist'}
                    </p>
                  </div>
                </button>

              </div>

              {/* RIGHT SIDE — ARTWORK */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleArtworkClick}
                  className="relative group focus:outline-none focus:ring-2 focus:ring-pink-500/60 rounded-3xl"
                  aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
                >
                  <div
                    className={`w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 rounded-3xl overflow-hidden transition-transform duration-300 ${
                      isPlaying ? 'scale-[1.02]' : ''
                    }`}
                    style={{
                      boxShadow: isPlaying
                        ? '0 0 50px rgba(255,72,185,0.95), 0 0 110px rgba(139,92,246,0.8)'
                        : '0 0 40px rgba(255,72,185,0.85), 0 0 80px rgba(139,92,246,0.6)',
                      border: '2px solid rgba(255,72,185,0.85)',
                      maxHeight: '600px',
                      maxWidth: '600px'
                    }}
                  >
                    {artworkUrl ? (
                      <img
                        src={artworkUrl}
                        alt={campaign.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#FF48B9] via-[#8B5CF6] to-[#2DD4BF] flex items-center justify-center">
                        <IoMusicalNotes className="text-white text-6xl opacity-40" />
                      </div>
                    )}

                    {/* Dark overlay for hover */}
                    {campaign.audio_preview_url && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    )}
                  </div>

                  {campaign.audio_preview_url && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_35px_rgba(0,0,0,0.85)] border border-white/15 transition-transform duration-200 ${
                          isPlaying ? 'bg-black/70 scale-105' : 'bg-black/80'
                        }`}
                      >
                        {isPlaying ? (
                          <IoPause className="text-white text-2xl" />
                        ) : (
                          <IoPlay className="text-white text-2xl translate-x-[1px]" />
                        )}
                      </div>
                    </div>
                  )}
                </button>
              </div>

            </div>

            {/* Hidden audio element */}
            {campaign.audio_preview_url && (
              <audio
                ref={audioRef}
                className="hidden"
                src={`${
                  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'
                }${campaign.audio_preview_url}`}
              />
            )}

          </div>
        </div>

        {/* 3 MAIN CARDS ROW */}
        <div className="mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            {[
              {
                title: null,
                border: 'rgba(139,92,246,0.55)',
                shadow: 'rgba(139,92,246,0.35)'
              },
              {
                title: 'Candy Machine Investment',
                border: 'rgba(255,72,185,0.6)',
                shadow: 'rgba(255,72,185,0.4)'
              },
              {
                title: 'Revenue Share Chart',
                border: 'rgba(148,163,184,0.55)',
                shadow: 'rgba(15,23,42,0.9)'
              }
            ].map((card, idx) => (
              <div
                key={idx}
                className="rounded-2xl p-5 lg:p-6 transition-transform duration-300 hover:-translate-y-[2px]"
                style={{
                  background:
                    'radial-gradient(circle at 0% 0%, rgba(148,163,184,0.2) 0, transparent 55%), radial-gradient(circle at 100% 100%, rgba(15,23,42,0.9) 0, #020617 70%)',
                  backdropFilter: 'blur(26px)',
                  border: `1px solid ${card.border}`,
                  boxShadow: `0 26px 45px ${card.shadow}`
                }}
              >
                {/* LEFT CARD: FUNDING */}
                {idx === 0 && (
                  <>
                    <div className="relative w-full h-40 sm:h-44 rounded-xl overflow-hidden mb-4 bg-black/60">
                      <img
                        src={modelImage}
                        alt="3D Model"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div
                        className="absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold text-white shadow-[0_0_18px_rgba(16,185,129,0.7)]"
                        style={{
                          background: 'linear-gradient(120deg, #12CE6A, #22C55E)'
                        }}
                      >
                        {fundingPercentage.toFixed(0)}% Funded
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-2xl font-semibold text-white tracking-wide">
                          ₹{campaign.amount_raised.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-gray-400 uppercase tracking-[0.16em]">
                          Raised
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-base text-gray-300">
                          ₹{campaign.target_amount.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-gray-500 uppercase tracking-[0.16em]">
                          Goal
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          background:
                            'linear-gradient(90deg, #FF48B9 0%, #8B5CF6 50%, #12CE6A 100%)',
                          width: `${Math.min(fundingPercentage, 100)}%`,
                          boxShadow: '0 0 16px rgba(255,72,185,0.7)'
                        }}
                      />
                    </div>

                    <p className="mt-3 text-[11px] text-gray-400 uppercase tracking-[0.18em]">
                      Funding Progress
                    </p>
                  </>
                )}

                {/* MIDDLE CARD: INVEST CTA */}
                {idx === 1 && (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-[0.18em]">
                          {card.title}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          Own a piece of the master recording.
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="text-[11px] text-gray-400 uppercase tracking-[0.18em]">
                          Total Price
                        </p>
                        <p className="text-2xl font-semibold text-white">
                          ₹{totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Partitions selector — Spotify neon slider */}
                    <div className="flex flex-col gap-4 mb-4">
                      <span className="text-xs text-gray-400">Partitions</span>

                      {/* Slider */}
                      <input
                        type="range"
                        min={1}
                        max={Math.max(1, availablePartitions)}
                        value={selectedPartitions}
                        onChange={(e) =>
                          setSelectedPartitions(Number(e.target.value))
                        }
                        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-700/40"
                        style={{
                          background: `linear-gradient(90deg, #22C55E ${
                            (selectedPartitions /
                              Math.max(1, availablePartitions)) *
                            100
                          }%, rgba(255,255,255,0.08) 0%)`,
                          boxShadow: '0 0 12px rgba(34,197,94,0.45)'
                        }}
                      />

                      {/* Slider handle styling */}
                      <style>
                        {`
                          input[type="range"]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 18px;
                            height: 18px;
                            background: #22C55E;
                            border-radius: 9999px;
                            box-shadow: 0 0 20px rgba(34,197,94,0.75);
                            cursor: pointer;
                            border: 2px solid white;
                          }
                          input[type="range"]::-moz-range-thumb {
                            width: 18px;
                            height: 18px;
                            background: #22C55E;
                            border-radius: 9999px;
                            box-shadow: 0 0 20px rgba(34,197,94,0.75);
                            cursor: pointer;
                            border: 2px solid white;
                          }
                        `}
                      </style>

                      <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                        <span>Selected: {selectedPartitions}</span>
                        <span>
                          Per partition:{' '}
                          <span className="text-white font-semibold">
                            ₹{campaign.partition_price.toLocaleString()}
                          </span>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!isAuthenticated) navigate('/login');
                        else if (user?.role === 'artist')
                          alert('Artists cannot invest');
                        else if (availablePartitions <= 0)
                          alert('Sold out!');
                        else setShowInvest(true);
                      }}
                      disabled={availablePartitions <= 0}
                      className="w-full py-3 text-sm font-semibold rounded-xl hover:opacity-95 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_18px_40px_rgba(255,72,185,0.75)] focus:outline-none focus:ring-2 focus:ring-pink-500/70"
                      style={{
                        background:
                          'linear-gradient(90deg, #FF48B9 0%, #ff6bcb 40%, #F97316 100%)'
                      }}
                    >
                      INVEST NOW
                    </button>
                    <p className="text-[11px] text-gray-400 mt-3 text-center">
                      {availablePartitions} of {totalPartitions} shares
                      available
                    </p>
                  </>
                )}

                {/* RIGHT CARD: REVENUE SHARE */}
                {idx === 2 && (
                  <>
                    <h3 className="text-xs text-gray-300 mb-1 font-semibold tracking-[0.18em] uppercase">
                      {card.title}
                    </h3>
                    <p className="text-[11px] text-gray-500 mb-4">
                      Artist Share vs Investor Pool
                    </p>
                    <div className="relative h-28 mb-4 rounded-xl overflow-hidden bg-gradient-to-b from-indigo-900/50 to-slate-950">
                      <svg
                        width="100%"
                        height="100%"
                        viewBox="0 0 300 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M 0,60 Q 75,40 150,50 T 300,45 L 300,100 L 0,100 Z"
                          fill="url(#purpleGrad)"
                          opacity="0.7"
                        />
                        <path
                          d="M 0,60 Q 75,40 150,50 T 300,45 L 300,0 L 0,20 Z"
                          fill="url(#greenGrad)"
                          opacity="0.7"
                        />
                        <defs>
                          <linearGradient
                            id="purpleGrad"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8B5CF6"
                              stopOpacity="0.9"
                            />
                            <stop
                              offset="100%"
                              stopColor="#312E81"
                              stopOpacity="0.1"
                            />
                          </linearGradient>
                          <linearGradient
                            id="greenGrad"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#22C55E"
                              stopOpacity="0.9"
                            />
                            <stop
                              offset="100%"
                              stopColor="#064E3B"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute bottom-2 left-3 text-[10px] text-gray-400">
                        Artist
                      </div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-gray-400">
                        User
                      </div>
                      <div className="absolute bottom-2 right-3 text-[10px] text-gray-400">
                        Total
                      </div>
                    </div>
                    <div className="space-y-1 text-xs mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Artist</span>
                        <span className="text-[#C4B5FD] font-semibold">
                          {100 - campaign.revenue_share_pct}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Investors</span>
                        <span className="text-[#6EE7B7] font-semibold">
                          {campaign.revenue_share_pct}%
                        </span>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <IoTrendingUp className="text-[#22C55E]" />
                        <span>Expected ROI: 15-30%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TIMELINE */}
        {(campaign.start_date || campaign.end_date) && (
          <div
            className="mb-6 rounded-2xl p-6"
            style={{
              background:
                'radial-gradient(circle at 0% 0%, rgba(248,250,252,0.12) 0, transparent 55%), linear-gradient(135deg, rgba(15,23,42,0.96), rgba(2,6,23,0.98))',
              backdropFilter: 'blur(26px)',
              border: '1px solid rgba(148,163,184,0.45)',
              boxShadow: '0 24px 45px rgba(15,23,42,0.95)'
            }}
          >
            <h3 className="text-sm font-semibold mb-6 flex items-center gap-2 tracking-[0.18em] uppercase text-gray-200">
              <IoCalendar className="text-[#FF48B9]" />
              Campaign Timeline
            </h3>
            <div className="flex items-center justify-around relative">
              <div
                className="absolute top-10 left-10 right-10 h-[2px] rounded-full"
                style={{
                  background:
                    'linear-gradient(90deg, #FF48B9 0%, #8B5CF6 50%, #22C55E 100%)',
                  boxShadow: '0 0 16px rgba(255,72,185,0.7)'
                }}
              />
              {[
                {
                  date: campaign.start_date,
                  label: 'Campaign Start',
                  gradient: 'linear-gradient(135deg, #FF48B9 0%, #8B5CF6 100%)',
                  color: 'rgba(255,72,185,0.6)'
                },
                {
                  date: null,
                  label: 'Track Release',
                  gradient: 'linear-gradient(135deg, #8B5CF6 0%, #22C55E 100%)',
                  color: 'rgba(139,92,246,0.6)'
                },
                {
                  date: campaign.end_date,
                  label: 'First Payout',
                  gradient: 'linear-gradient(135deg, #22C55E 0%, #0ea56b 100%)',
                  color: 'rgba(34,197,94,0.7)'
                }
              ].map((milestone, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <div
                    className="w-18 h-18 sm:w-20 sm:h-20 rounded-full p-[3px] mb-2 shadow-[0_0_24px_rgba(15,23,42,0.9)]"
                    style={{
                      background: milestone.gradient,
                      boxShadow: `0 0 22px ${milestone.color}`
                    }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-black/90">
                      <img
                        src={
                          i === 0
                            ? campaignStartImage
                            : i === 1
                            ? releaseDayImage
                            : payoutImage
                        }
                        alt={milestone.label}
                        className="w-full h-full object-cover opacity-60"
                      />
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gray-100">
                    {milestone.label}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    {milestone.date
                      ? new Date(milestone.date).toLocaleDateString()
                      : 'Coming Soon'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTTOM ROW: INVESTMENTS + COMMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {[InvestmentHistory, CommentSection].map((Component, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 lg:p-6"
              style={{
                background:
                  'linear-gradient(135deg, rgba(15,23,42,0.97), rgba(2,6,23,0.98))',
                backdropFilter: 'blur(24px)',
                border:
                  i === 0
                    ? '1px solid rgba(139,92,246,0.45)'
                    : '1px solid rgba(148,163,184,0.35)',
                boxShadow:
                  i === 0
                    ? '0 24px 45px rgba(76,29,149,0.55)'
                    : '0 24px 45px rgba(15,23,42,0.9)'
              }}
            >
              <Component campaignId={i === 0 ? Number(id) : campaign.id} />
            </div>
          ))}
        </div>
      </div>

      {/* INVEST MODAL */}
      {showInvest && campaign && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4"
          style={{ backdropFilter: 'blur(10px)' }}
        >
          <div className="max-w-md w-full">
            <InvestmentForm
              campaignId={Number(id)}
              partitionPrice={campaign.partition_price}
              minPartitions={minPartitions}
              availablePartitions={availablePartitions}
              onClose={() => setShowInvest(false)}
              onSuccess={handleInvestmentSuccess}
            />
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {showShare && (
        <ShareModal
          title={campaign.title}
          url={shareUrl}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}

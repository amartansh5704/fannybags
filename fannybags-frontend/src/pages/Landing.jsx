import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import api from '../services/api';

// ============================================================================
// CONFIG
// ============================================================================

const CONFIG = {
  hero: {
    headline: 'FannyBags',
    subheadline: 'Own the Vibe. Back emerging artists. Earn royalties.',
    btn1Text: 'Start Investing',
    btn1Color: '#471075',
    btn2Text: 'Learn More',
    btn2Color: 'transparent',
    visible: true,
  },
  howItWorks: {
    title: 'How It Works',
    cards: [
      {
        icon: '📤',
        title: 'Create Campaign',
        desc: 'Artists upload songs & set goals',
      },
      {
        icon: '💳',
        title: 'Invest',
        desc: 'Purchase royalty shares securely',
      },
      {
        icon: '📈',
        title: 'Earn Royalties',
        desc: 'Receive monthly payouts',
      },
    ],
    visible: true,
  },
  trending: {
    title: 'Trending Campaigns',
    btnText: 'View / Invest',
    btnColor: '#7703c4',
    visible: true,
  },
  aiPredictor: {
    title: '🎯 AI Revenue Predictor',
    subtitle: "Forecast your song's earning potential",
    btnText: 'Predict Revenue',
    btnColor: '#4416b1',
    visible: true,
  },
  wallet: {
    title: 'Your Wallet',
    subtitle: 'Join the Future of Music Investing',
    btn1Text: 'Top Up Wallet',
    btn2Text: 'Invest Now',
    btn2Color: '#8b48a3',
    visible: true,
  },
};

// ============================================================================
// THREE.JS SETUP & CAMERA ANIMATION ENGINE
// ============================================================================

const CAMERA_KEYFRAMES = [
  {
    scroll: 0,
    position: [-8.448468982765863, 6.585791912015686, 0.4481115533639852],
    target: [-8.449462695332803, -0.7129978929869739, 0.34705424994401907],
  },
  {
    scroll: 20,
    position: [-8.644926114556444, 4.581535786702283, 2.6175347640802347],
    target: [-8.739522109070194, 3.351875776506595, -6.885024661042207],
  },
  {
    scroll: 40,
    position: [-12.733766014873826, 3.8442967711921887, 0.8006395621417783],
    target: [-12.43193041669134, 3.7653189123518644, 0.786531770466923],
  },
  {
    scroll: 60,
    position: [-6.230066281142463, 5.587750191940149, 2.877662720795528],
    target: [-5.996028236293589, 3.3164604504844895, 8.16347068747733],
  },
  {
    scroll: 80,
    position: [-8.965101163052893, 3.8385667905892413, 8.54143878909064],
    target: [-8.966299489250146, 3.8384054998157855, 8.541500701886946],
  },
  {
    scroll: 100,
    position: [-8.448468982765863, 6.585791912015686, 0.4481115533639852],
    target: [-8.449462695332803, -0.7129978929869739, 0.34705424994401907],
  },
];

const lerpVector = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

const interpolateKeyframes = (scrollPercent) => {
  const normalizedScroll = Math.min(Math.max(scrollPercent, 0), 100);

  for (let i = 0; i < CAMERA_KEYFRAMES.length - 1; i++) {
    const current = CAMERA_KEYFRAMES[i];
    const next = CAMERA_KEYFRAMES[i + 1];
    const range = next.scroll - current.scroll;
    const t = Math.max(0, Math.min(1, (normalizedScroll - current.scroll) / range));

    if (normalizedScroll >= current.scroll && normalizedScroll <= next.scroll) {
      return {
        position: lerpVector(current.position, next.position, t),
        target: lerpVector(current.target, next.target, t),
      };
    }
  }

  return CAMERA_KEYFRAMES[CAMERA_KEYFRAMES.length - 1];
};

// ============================================================================
// CHECKPOINT OVERLAYS
// ============================================================================

function HeroCheckpoint({ scrollPercent, navigate, config }) {
  const opacity = Math.max(0, 1 - scrollPercent / 15);

  if (!config.hero.visible) return null;

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
      style={{ opacity }}
    >
      <div className="pointer-events-auto text-center">
        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 drop-shadow-lg">
          {config.hero.headline}
        </h1>
        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl drop-shadow">
          {config.hero.subheadline}
        </p>

        <div className="flex gap-6 justify-center flex-wrap">
          <button
            onClick={() => navigate('/campaigns')}
            style={{
              backgroundColor: config.hero.btn1Color === 'transparent' ? 'transparent' : config.hero.btn1Color,
              borderColor: config.hero.btn1Color === 'transparent' ? 'white' : 'transparent',
              borderWidth: config.hero.btn1Color === 'transparent' ? '2px' : '0',
            }}
            className="px-8 py-4 text-white font-bold rounded-lg hover:shadow-2xl transition-all transform hover:scale-110 drop-shadow-lg"
          >
            {config.hero.btn1Text}
          </button>
          <button
            onClick={() => window.scrollBy({ top: window.innerHeight * 1.5, behavior: 'smooth' })}
            style={{
              borderColor: config.hero.btn2Color === 'transparent' ? 'white' : config.hero.btn2Color,
              borderWidth: '2px',
              color: 'white',
            }}
            className="px-8 py-4 font-bold rounded-lg hover:bg-white/10 transition-all drop-shadow-lg"
          >
            {config.hero.btn2Text}
          </button>
        </div>
      </div>
    </div>
  );
}

function HowItWorksCheckpoint({ scrollPercent, config }) {
  const localScroll = Math.max(0, Math.min(1, (scrollPercent - 15) / 20));
  const opacity = localScroll > 0 && localScroll < 1 ? Math.min(localScroll * 2, 1 - (localScroll - 0.5) * 2) : 0;
  const translateY = (1 - localScroll) * 50;

  if (!config.howItWorks.visible) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      style={{ opacity, transform: `translateY(${translateY}px)` }}
    >
      <div className="pointer-events-auto bg-black/60 backdrop-blur-lg p-12 rounded-2xl max-w-2xl">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">{config.howItWorks.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {config.howItWorks.cards.map((item, i) => (
            <div key={i} className="text-center p-4 rounded-lg bg-white/8 border border-white/20">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrendingCheckpoint({ scrollPercent, config }) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const navigate = useNavigate();

  const localScroll = Math.max(0, Math.min(1, (scrollPercent - 35) / 20));
  const opacity = localScroll > 0 && localScroll < 1 ? Math.min(localScroll * 2, 1 - (localScroll - 0.5) * 2) : 0;

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        const res = await api.get('/campaigns/trending');
        setCampaigns(res.data.slice(0, 6));
      } catch (err) {
        toast.error('Failed to load trending campaigns');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleCardClick = async (campaignId) => {
    try {
      setSelected(campaignId);
      const res = await api.get(`/campaigns/${campaignId}`);
      setCampaignDetail(res.data);
    } catch (err) {
      toast.error('Failed to load campaign details');
      console.error(err);
    }
  };

  if (!config.trending.visible) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-4"
      style={{ opacity }}
    >
      <div className="pointer-events-auto w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center drop-shadow">{config.trending.title}</h2>

        {loading ? (
          <div className="text-center text-gray-300">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => handleCardClick(c.id)}
                className="bg-black/60 backdrop-blur-lg p-4 rounded-lg border border-white/20 cursor-pointer hover:border-[#12CE6A]/60 transition-all hover:scale-105 drop-shadow-lg"
              >
                {c.thumbnail && (
                  <img src={c.thumbnail} alt={c.title} className="w-full h-32 object-cover rounded mb-3" />
                )}
                <h3 className="font-bold text-white truncate">{c.title}</h3>
                <p className="text-xs text-gray-400 mb-2">{c.genre || 'Music'}</p>
                <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#12CE6A] to-[#FF48B9]"
                    style={{ width: `${(c.progress || 0) * 100}%` }}
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/campaign/${c.id}`);
                  }}
                  style={{ backgroundColor: config.trending.btnColor }}
                  className="w-full px-3 py-2 text-black font-bold rounded text-sm hover:opacity-90 transition-all"
                >
                  {config.trending.btnText}
                </button>
              </div>
            ))}
          </div>
        )}

        {selected && campaignDetail && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-black/90 border border-white/20 p-8 rounded-2xl max-w-2xl max-h-96 overflow-y-auto">
              <h3 className="text-2xl font-bold text-white mb-4">{campaignDetail.title}</h3>
              <p className="text-gray-300 mb-6">{campaignDetail.description}</p>
              <div className="space-y-2 text-sm text-gray-300 mb-6">
                <p>
                  <strong>Goal:</strong> ${campaignDetail.funding_goal}
                </p>
                <p>
                  <strong>Raised:</strong> ${campaignDetail.amount_raised}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AIPredictorCheckpoint({ scrollPercent, config }) {
  const [campaignId, setCampaignId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const localScroll = Math.max(0, Math.min(1, (scrollPercent - 55) / 20));
  const opacity = localScroll > 0 && localScroll < 1 ? Math.min(localScroll * 2, 1 - (localScroll - 0.5) * 2) : 0;

  const handlePredict = async () => {
    if (!campaignId.trim()) {
      toast.error('Enter a campaign ID');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/ai/predictor', { campaign_id: campaignId });
      setResult(res.data);
      toast.success('Prediction ready!');
    } catch (err) {
      toast.error('Prediction failed. Try another ID.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!config.aiPredictor.visible) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-4"
      style={{ opacity }}
    >
      <div className="pointer-events-auto bg-black/60 backdrop-blur-lg p-8 rounded-2xl max-w-xl drop-shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-4 text-center">{config.aiPredictor.title}</h2>
        <p className="text-gray-300 text-center mb-6">{config.aiPredictor.subtitle}</p>

        <input
          type="text"
          placeholder="Campaign ID"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder-gray-500 mb-4"
        />

        <button
          onClick={handlePredict}
          disabled={loading}
          style={{ backgroundColor: config.aiPredictor.btnColor }}
          className="w-full px-4 py-3 text-black font-bold rounded hover:shadow-lg disabled:opacity-50 transition-all"
        >
          {loading ? 'Predicting...' : config.aiPredictor.btnText}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-white/8 border border-[#12CE6A]/50 rounded">
            <p className="text-sm text-gray-300 mb-2">
              <strong>Low:</strong> ${result.low?.toLocaleString() || '—'}
            </p>
            <p className="text-sm text-gray-300 mb-2">
              <strong>Median:</strong> ${result.median?.toLocaleString() || '—'}
            </p>
            <p className="text-sm text-gray-300">
              <strong>High:</strong> ${result.high?.toLocaleString() || '—'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function WalletCheckpoint({ scrollPercent, navigate, config }) {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);

  const localScroll = Math.max(0, Math.min(1, (scrollPercent - 75) / 25));
  const opacity = localScroll > 0 && localScroll < 1 ? 1 : 0;

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        setLoading(true);
        const res = await api.get('/wallet/balance');
        setBalance(res.data.balance);
      } catch (err) {
        console.error('Wallet fetch failed:', err);
        setBalance(0);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, []);

  const handleTopUp = async () => {
    try {
      toast.loading('Processing...');
      await api.post('/wallet/topup', { amount: 100 });
      toast.dismiss();
      toast.success('Wallet topped up!');
      setBalance((b) => (b || 0) + 100);
    } catch (err) {
      toast.error('Top-up failed');
      console.error(err);
    }
  };

  const handleInvest = async () => {
    try {
      toast.loading('Initiating payment...');
      await api.post('/payments/mock', { amount: 50 });
      toast.dismiss();
      toast.success('Payment successful!');
      navigate('/campaigns');
    } catch (err) {
      toast.error('Payment failed');
      console.error(err);
    }
  };

  if (!config.wallet.visible) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 p-4"
      style={{ opacity }}
    >
      <div className="pointer-events-auto bg-black/60 backdrop-blur-lg p-8 rounded-2xl max-w-xl drop-shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-2 text-center">{config.wallet.title}</h2>
        <p className="text-gray-300 text-center mb-8">{config.wallet.subtitle}</p>

        <div className="bg-white/8 border border-white/20 p-6 rounded-lg mb-6 text-center">
          <p className="text-gray-400 text-sm mb-2">Balance</p>
          <p className="text-4xl font-bold text-[#12CE6A]">
            {loading ? '...' : `₹${(balance || 0).toLocaleString()}`}
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleTopUp}
            className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded transition-all border border-white/20"
          >
            {config.wallet.btn1Text}
          </button>
          <button
            onClick={handleInvest}
            style={{ backgroundColor: config.wallet.btn2Color }}
            className="flex-1 px-4 py-3 text-black font-bold rounded hover:shadow-lg transition-all"
          >
            {config.wallet.btn2Text}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function Landing() {
  const navigate = useNavigate();
  const [scrollPercent, setScrollPercent] = useState(0);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0033);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log('✅ 3D model loaded');
      },
      undefined,
      (error) => {
        console.error('❌ Failed to load model:', error);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, []);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        setScrollPercent(percent);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update camera on scroll
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = interpolateKeyframes(scrollPercent);
    const cameraObj = cameraRef.current;

    cameraObj.position.set(...camera.position);
    cameraObj.lookAt(...camera.target);
  }, [scrollPercent]);

  return (
    <div
      className="relative w-full overflow-x-hidden bg-gradient-to-b from-[#50207A] via-[#1a0033] to-[#0a001a]"
      ref={containerRef}
    >
      <Toaster position="top-center" />

      {/* Three.js Canvas */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-0">
        <canvas ref={canvasRef} className="w-full h-full" />
      </div>

      {/* OVERLAY CONTAINER - Checkpoints */}
      <div className="relative z-10 w-full">
        {/* Checkpoint 0: Hero */}
        <section className="relative w-full h-screen flex items-center justify-center">
          <HeroCheckpoint scrollPercent={scrollPercent} navigate={navigate} config={CONFIG} />
        </section>

        {/* Checkpoint 1: How It Works */}
        <section className="relative w-full h-screen flex items-center justify-center">
          <HowItWorksCheckpoint scrollPercent={scrollPercent} config={CONFIG} />
        </section>

        {/* Checkpoint 2: Trending */}
        <section className="relative w-full h-screen flex items-center justify-center">
          <TrendingCheckpoint scrollPercent={scrollPercent} config={CONFIG} />
        </section>

        {/* Checkpoint 3: AI Predictor */}
        <section className="relative w-full h-screen flex items-center justify-center">
          <AIPredictorCheckpoint scrollPercent={scrollPercent} config={CONFIG} />
        </section>

        {/* Checkpoint 4: Wallet */}
        <section className="relative w-full h-screen flex items-center justify-center">
          <WalletCheckpoint scrollPercent={scrollPercent} navigate={navigate} config={CONFIG} />
        </section>

        {/* Extra scroll buffer */}
        <div className="h-32 bg-gradient-to-b from-transparent to-[#50207A]" />
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const DEFAULT_CONFIG = {
  hero: {
    headline: 'FannyBags',
    subheadline: 'Own the Vibe. Back emerging artists. Earn royalties.',
    btn1Text: 'Start Investing',
    btn1Color: '#471075',
    btn2Text: 'Learn More',
    btn2Color: 'transparent',
    visible: true,
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  },
  howItWorks: {
    title: 'How It Works',
    cards: [
      { icon: '📤', title: 'Create Campaign', desc: 'Artists upload songs & set goals' },
      { icon: '💳', title: 'Invest', desc: 'Purchase royalty shares securely' },
      { icon: '📈', title: 'Earn Royalties', desc: 'Receive monthly payouts' },
    ],
    visible: true,
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  },
  trending: {
    title: 'Trending Campaigns',
    btnText: 'View / Invest',
    btnColor: '#7703c4',
    visible: true,
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  },
  aiPredictor: {
    title: '🎯 AI Revenue Predictor',
    subtitle: "Forecast your song's earning potential",
    btnText: 'Predict Revenue',
    btnColor: '#4416b1',
    visible: true,
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  },
  wallet: {
    title: 'Your Wallet',
    subtitle: 'Join the Future of Music Investing',
    btn1Text: 'Top Up Wallet',
    btn2Text: 'Invest Now',
    btn2Color: '#8b48a3',
    visible: true,
    position: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  },
};

export default function LandingEditor() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeSection, setActiveSection] = useState('hero');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);

  const CAMERA_KEYFRAMES = {
    hero: {
      position: [-8.448468982765863, 6.585791912015686, 0.4481115533639852],
      target: [-8.449462695332803, -0.7129978929869739, 0.34705424994401907],
    },
    howItWorks: {
      position: [-8.644926114556444, 4.581535786702283, 2.6175347640802347],
      target: [-8.739522109070194, 3.351875776506595, -6.885024661042207],
    },
    trending: {
      position: [-12.733766014873826, 3.8442967711921887, 0.8006395621417783],
      target: [-12.43193041669134, 3.7653189123518644, 0.786531770466923],
    },
    aiPredictor: {
      position: [-6.230066281142463, 5.587750191940149, 2.877662720795528],
      target: [-5.996028236293589, 3.3164604504844895, 8.16347068747733],
    },
    wallet: {
      position: [-8.965101163052893, 3.8385667905892413, 8.54143878909064],
      target: [-8.966299489250146, 3.8384054998157855, 8.541500701886946],
    },
  };

  // Initialize Three.js scene for 3D model preview
  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0033);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasRef.current });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log('✅ 3D model loaded in editor');
      },
      undefined,
      (error) => {
        console.error('❌ Failed to load model:', error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
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

  // Update camera when section changes
  useEffect(() => {
    if (!cameraRef.current) return;

    const keyframe = CAMERA_KEYFRAMES[activeSection];
    if (!keyframe) return;

    const camera = cameraRef.current;
    camera.position.set(...keyframe.position);
    camera.lookAt(...keyframe.target);
  }, );

  const updateField = (section, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const updatePosition = (section, posProperty, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        position: {
          ...prev[section].position,
          [posProperty]: value,
        },
      },
    }));
  };

  const updateCardField = (section, cardIndex, field, value) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        cards: prev[section].cards.map((card, i) =>
          i === cardIndex ? { ...card, [field]: value } : card
        ),
      },
    }));
  };

  const toggleSection = (section) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        visible: !prev[section].visible,
      },
    }));
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;

    const element = document.getElementById(`card-${activeSection}`);
    if (element) {
      const rect = element.parentElement.getBoundingClientRect();
      const currentLeft = parseInt(config[activeSection].position.left) || 50;
      const currentTop = parseInt(config[activeSection].position.top) || 50;

      updatePosition(activeSection, 'left', Math.min(Math.max(currentLeft + (deltaX / rect.width) * 100, 0), 100) + '%');
      updatePosition(activeSection, 'top', Math.min(Math.max(currentTop + (deltaY / rect.height) * 100, 0), 100) + '%');
      updatePosition(activeSection, 'transform', 'translate(0, 0)');
    }

    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, );

  const exportConfig = () => {
    const json = JSON.stringify(config, null, 2);
    console.log('📋 CONFIG JSON:\n', json);
    navigator.clipboard.writeText(json);
    toast.success('Full config copied to clipboard!');
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    toast.success('Reset to defaults');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#50207A] via-[#1a0033] to-[#0a001a] text-white p-4">
      <Toaster position="top-right" />

      <div className="max-w-full mx-auto">
        <h1 className="text-4xl font-black mb-2">🎨 Visual Layout Editor</h1>
        <p className="text-gray-400 mb-6">Edit text, colors, positions & see the 3D model in real-time</p>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Panel: Controls */}
          <div className="xl:col-span-1">
            <div className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-6 sticky top-4 max-h-[90vh] overflow-y-auto space-y-4">
              <h2 className="text-2xl font-bold text-[#12CE6A]">Sections</h2>

              {Object.keys(config).map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex justify-between items-center ${
                    activeSection === section
                      ? 'bg-[#12CE6A]/30 border border-[#12CE6A]'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="font-semibold capitalize">{section}</span>
                  <input
                    type="checkbox"
                    checked={config[section].visible}
                    onChange={() => toggleSection(section)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-4 h-4 cursor-pointer"
                  />
                </button>
              ))}

              <div className="border-t border-white/20 pt-4 space-y-2">
                <button
                  onClick={exportConfig}
                  className="w-full px-4 py-3 bg-[#12CE6A] text-[#50207A] font-bold rounded-lg hover:bg-[#0fb85a] transition-all text-sm"
                >
                  📋 Export Config
                </button>
                <button
                  onClick={resetConfig}
                  className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg transition-all text-sm"
                >
                  ↺ Reset
                </button>
              </div>
            </div>
          </div>

          {/* Middle: 3D Preview with Draggable Cards */}
          <div className="xl:col-span-2">
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden h-[600px] relative">
              <canvas ref={canvasRef} className="w-full h-full" />

              {/* Draggable Card Overlay */}
              {config[activeSection].visible && (
                <div
                  id={`card-${activeSection}`}
                  className="absolute bg-black/60 backdrop-blur-lg p-6 rounded-2xl border-2 border-[#12CE6A] cursor-move hover:border-white transition-all"
                  style={{
                    top: config[activeSection].position.top,
                    left: config[activeSection].position.left,
                    transform: config[activeSection].position.transform,
                    maxWidth: '300px',
                  }}
                  onMouseDown={(e) => handleMouseDown(e, activeSection)}
                >
                  <div className="text-center">
                    <p className="text-xs text-gray-400 mb-2">📍 Drag to reposition</p>
                    {activeSection === 'hero' && (
                      <div>
                        <h1 className="text-2xl font-black text-white">{config.hero.headline}</h1>
                        <p className="text-sm text-gray-300 mt-2">{config.hero.subheadline}</p>
                      </div>
                    )}
                    {activeSection === 'howItWorks' && (
                      <div>
                        <h2 className="text-xl font-bold text-white">{config.howItWorks.title}</h2>
                      </div>
                    )}
                    {activeSection === 'trending' && (
                      <div>
                        <h2 className="text-xl font-bold text-white">{config.trending.title}</h2>
                      </div>
                    )}
                    {activeSection === 'aiPredictor' && (
                      <div>
                        <h2 className="text-xl font-bold text-white">{config.aiPredictor.title}</h2>
                        <p className="text-xs text-gray-400 mt-1">{config.aiPredictor.subtitle}</p>
                      </div>
                    )}
                    {activeSection === 'wallet' && (
                      <div>
                        <h2 className="text-xl font-bold text-white">{config.wallet.title}</h2>
                        <p className="text-xs text-gray-400 mt-1">{config.wallet.subtitle}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Editor */}
          <div className="xl:col-span-1">
            <div className="bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-6 max-h-[600px] overflow-y-auto space-y-4">
              <h3 className="text-xl font-bold text-[#12CE6A] capitalize">{activeSection} Settings</h3>

              {/* Text Fields */}
              {activeSection === 'hero' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Headline</label>
                    <input
                      type="text"
                      value={config.hero.headline}
                      onChange={(e) => updateField('hero', 'headline', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Subheadline</label>
                    <textarea
                      value={config.hero.subheadline}
                      onChange={(e) => updateField('hero', 'subheadline', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                      rows="2"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 1 Text</label>
                    <input
                      type="text"
                      value={config.hero.btn1Text}
                      onChange={(e) => updateField('hero', 'btn1Text', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 1 Color</label>
                    <input
                      type="color"
                      value={config.hero.btn1Color}
                      onChange={(e) => updateField('hero', 'btn1Color', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 2 Text</label>
                    <input
                      type="text"
                      value={config.hero.btn2Text}
                      onChange={(e) => updateField('hero', 'btn2Text', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 2 Color</label>
                    <input
                      type="color"
                      value={config.hero.btn2Color}
                      onChange={(e) => updateField('hero', 'btn2Color', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'howItWorks' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={config.howItWorks.title}
                      onChange={(e) => updateField('howItWorks', 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div className="border-t border-white/10 pt-3">
                    <label className="block text-xs font-semibold mb-2">Cards</label>
                    {config.howItWorks.cards.map((card, i) => (
                      <div key={i} className="bg-white/5 p-2 rounded mb-2 space-y-1">
                        <input
                          type="text"
                          value={card.icon}
                          onChange={(e) => updateCardField('howItWorks', i, 'icon', e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                        />
                        <input
                          type="text"
                          value={card.title}
                          onChange={(e) => updateCardField('howItWorks', i, 'title', e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === 'trending' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={config.trending.title}
                      onChange={(e) => updateField('trending', 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={config.trending.btnText}
                      onChange={(e) => updateField('trending', 'btnText', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button Color</label>
                    <input
                      type="color"
                      value={config.trending.btnColor}
                      onChange={(e) => updateField('trending', 'btnColor', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'aiPredictor' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={config.aiPredictor.title}
                      onChange={(e) => updateField('aiPredictor', 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={config.aiPredictor.subtitle}
                      onChange={(e) => updateField('aiPredictor', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button Text</label>
                    <input
                      type="text"
                      value={config.aiPredictor.btnText}
                      onChange={(e) => updateField('aiPredictor', 'btnText', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button Color</label>
                    <input
                      type="color"
                      value={config.aiPredictor.btnColor}
                      onChange={(e) => updateField('aiPredictor', 'btnColor', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {activeSection === 'wallet' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Title</label>
                    <input
                      type="text"
                      value={config.wallet.title}
                      onChange={(e) => updateField('wallet', 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={config.wallet.subtitle}
                      onChange={(e) => updateField('wallet', 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 1 Text</label>
                    <input
                      type="text"
                      value={config.wallet.btn1Text}
                      onChange={(e) => updateField('wallet', 'btn1Text', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 2 Text</label>
                    <input
                      type="text"
                      value={config.wallet.btn2Text}
                      onChange={(e) => updateField('wallet', 'btn2Text', e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Button 2 Color</label>
                    <input
                      type="color"
                      value={config.wallet.btn2Color}
                      onChange={(e) => updateField('wallet', 'btn2Color', e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
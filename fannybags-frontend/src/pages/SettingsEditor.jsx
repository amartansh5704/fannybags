import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

const DEFAULT_SETTINGS = {
  bloom: { enabled: true, strength: 1.5, radius: 0.5, threshold: 0.1 },
  tone: { exposure: 1, saturation: 1 },
  ambientLight: 0.8,
  directionalLight: 1,
  directionalX: 10,
  directionalY: 15,
  directionalZ: 10,
  autoRotate: true,
  backgroundColor: '#1a1a2e',
};

export default function SettingsEditor() {
  const container = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const controlsRef = useRef(null);
  const bloomPassRef = useRef(null);
  const directionalLightRef = useRef(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Initialize Three.js
  useEffect(() => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(settings.backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = settings.tone.exposure;
    container.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      settings.bloom.strength,
      settings.bloom.radius,
      settings.bloom.threshold
    );
    bloomPass.enabled = settings.bloom.enabled;
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;
    composerRef.current = composer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientLight);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, settings.directionalLight);
    directionalLight.position.set(settings.directionalX, settings.directionalY, settings.directionalZ);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    directionalLightRef.current = directionalLight;

    // Grid
    const gridHelper = new THREE.GridHelper(50, 50);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = settings.autoRotate;
    controls.autoRotateSpeed = 3;
    controlsRef.current = controls;

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      '/models/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.castShadow = true;
        model.receiveShadow = true;

        model.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            
            if (node.material) {
              const materials = Array.isArray(node.material) ? node.material : [node.material];
              materials.forEach((mat) => {
                if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                mat.side = THREE.DoubleSide;
              });
            }
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 15 / maxDim;

        model.scale.set(scale, scale, scale);
        const scaledBox = new THREE.Box3().setFromObject(model);
        const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
        model.position.copy(scaledCenter).multiplyScalar(-1);

        scene.add(model);

        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        const maxScaledDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
        const distance = maxScaledDim * 2.5;

        camera.position.set(distance * 0.5, distance * 0.3, distance);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        setModelLoaded(true);
        toast.success('✅ Model loaded! Adjust effects below.');
      },
      undefined,
      (err) => {
        toast.error('❌ Failed to load model');
        console.error(err);
      }
    );

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      composer.render();
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = container.current.clientWidth;
      const h = container.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      composer.dispose();
    };
  }, );

  // Update all settings in real-time
  useEffect(() => {
    if (!sceneRef.current) return;

    // Background color
    sceneRef.current.background = new THREE.Color(settings.backgroundColor);

    // Bloom
    if (bloomPassRef.current) {
      bloomPassRef.current.enabled = settings.bloom.enabled;
      bloomPassRef.current.strength = settings.bloom.strength;
      bloomPassRef.current.radius = settings.bloom.radius;
      bloomPassRef.current.threshold = settings.bloom.threshold;
    }

    // Tone mapping
    if (rendererRef.current) {
      rendererRef.current.toneMappingExposure = settings.tone.exposure;
    }

    // Ambient light
    const ambientLight = sceneRef.current.children.find((c) => c instanceof THREE.AmbientLight);
    if (ambientLight) {
      ambientLight.intensity = settings.ambientLight;
    }

    // Directional light
    if (directionalLightRef.current) {
      directionalLightRef.current.intensity = settings.directionalLight;
      directionalLightRef.current.position.set(
        settings.directionalX,
        settings.directionalY,
        settings.directionalZ
      );
    }

    // Auto rotate
    if (controlsRef.current) {
      controlsRef.current.autoRotate = settings.autoRotate;
    }
  }, [settings]);

  const exportSettings = () => {
    const json = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('📋 Settings copied!');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.success('↺ Reset to defaults');
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Toaster position="top-right" />

      {/* Viewer */}
      <div className="flex-1 relative">
        <div ref={container} className="w-full h-screen" />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/20 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-[#12CE6A] mb-2">🎨 Model Settings Editor</h1>
          <p className="text-sm text-gray-300">Adjust effects in real-time</p>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="w-96 bg-black/80 border-l border-white/20 p-6 overflow-y-auto space-y-6 max-h-screen">
        {modelLoaded ? (
          <>
            {/* Background */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#12CE6A]">🎨 Background</h3>
              <div>
                <label className="block text-xs font-semibold mb-2">Color</label>
                <input
                  type="color"
                  value={settings.backgroundColor}
                  onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Bloom */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.bloom.enabled}
                  onChange={(e) => setSettings({ ...settings, bloom: { ...settings.bloom, enabled: e.target.checked } })}
                  className="w-4 h-4 cursor-pointer"
                />
                <h3 className="font-bold text-[#12CE6A]">✨ Bloom (Glow)</h3>
              </div>

              {settings.bloom.enabled && (
                <div className="space-y-2 pl-6">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Strength: {settings.bloom.strength.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={settings.bloom.strength}
                      onChange={(e) =>
                        setSettings({ ...settings, bloom: { ...settings.bloom, strength: parseFloat(e.target.value) } })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Radius: {settings.bloom.radius.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.bloom.radius}
                      onChange={(e) =>
                        setSettings({ ...settings, bloom: { ...settings.bloom, radius: parseFloat(e.target.value) } })
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Threshold: {settings.bloom.threshold.toFixed(2)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={settings.bloom.threshold}
                      onChange={(e) =>
                        setSettings({ ...settings, bloom: { ...settings.bloom, threshold: parseFloat(e.target.value) } })
                      }
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tone Mapping */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#12CE6A]">🎬 Tone Mapping</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Exposure: {settings.tone.exposure.toFixed(2)}</label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={settings.tone.exposure}
                  onChange={(e) => setSettings({ ...settings, tone: { ...settings.tone, exposure: parseFloat(e.target.value) } })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Ambient Lighting */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#12CE6A]">💡 Ambient Light</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Intensity: {settings.ambientLight.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.ambientLight}
                  onChange={(e) => setSettings({ ...settings, ambientLight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            {/* Directional Lighting */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#12CE6A]">☀️ Directional Light</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Intensity: {settings.directionalLight.toFixed(2)}</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={settings.directionalLight}
                  onChange={(e) => setSettings({ ...settings, directionalLight: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold mb-1">X: {settings.directionalX.toFixed(1)}</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={settings.directionalX}
                    onChange={(e) => setSettings({ ...settings, directionalX: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Y: {settings.directionalY.toFixed(1)}</label>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={settings.directionalY}
                    onChange={(e) => setSettings({ ...settings, directionalY: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Z: {settings.directionalZ.toFixed(1)}</label>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={settings.directionalZ}
                    onChange={(e) => setSettings({ ...settings, directionalZ: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Auto Rotate */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRotate}
                  onChange={(e) => setSettings({ ...settings, autoRotate: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold">Auto Rotate</span>
              </label>
            </div>

            {/* Export */}
            <div className="space-y-2">
              <button
                onClick={exportSettings}
                className="w-full px-4 py-2 bg-[#12CE6A] text-black font-bold rounded-lg hover:bg-[#0fb85a]"
              >
                📋 Export Settings
              </button>
              <button
                onClick={resetSettings}
                className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg"
              >
                ↺ Reset
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-400">Loading model...</p>
          </div>
        )}
      </div>
    </div>
  );
}
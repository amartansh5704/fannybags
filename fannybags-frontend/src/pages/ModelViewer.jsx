import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

const DEFAULT_SETTINGS = {
  bloom: { enabled: true, strength: 1.5, radius: 0.5, threshold: 0.1 },
  tone: { exposure: 1, saturation: 1 },
  ao: { intensity: 0.5 },
  ambientLight: 0.8,
  directionalLight: 1,
  autoRotate: true,
};

export default function ModelViewer() {
  const container = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const composerRef = useRef(null);
  const controlsRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [modelInfo, setModelInfo] = useState({
    name: 'None',
    triangles: 0,
    materials: 0,
    textures: 0,
    size: '0 MB',
  });

  // Initialize Three.js
  useEffect(() => {
    const width = container.current.clientWidth;
    const height = container.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
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
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, settings.ambientLight);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, settings.directionalLight);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Simplified lighting (HDRI would require external file)
    // Instead, use better material properties for realistic look
    scene.environment = null;
    scene.background = new THREE.Color(0x1a1a2e);

    // Grid helper
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

  // Update bloom settings
  useEffect(() => {
    if (!composerRef.current || !settings.bloom.enabled) return;

    const bloomPass = composerRef.current.passes.find((p) => p instanceof UnrealBloomPass);
    if (bloomPass) {
      bloomPass.strength = settings.bloom.strength;
      bloomPass.radius = settings.bloom.radius;
      bloomPass.threshold = settings.bloom.threshold;
    }
  }, [settings.bloom]);

  // Update tone mapping
  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.toneMappingExposure = settings.tone.exposure;
  }, [settings.tone.exposure]);

  // Update lighting
  useEffect(() => {
    if (!sceneRef.current) return;

    const ambientLight = sceneRef.current.children.find((c) => c instanceof THREE.AmbientLight);
    if (ambientLight) {
      ambientLight.intensity = settings.ambientLight;
    }

    const directionalLight = sceneRef.current.children.find((c) => c instanceof THREE.DirectionalLight);
    if (directionalLight) {
      directionalLight.intensity = settings.directionalLight;
    }

    if (controlsRef.current) {
      controlsRef.current.autoRotate = settings.autoRotate;
    }
  }, [settings.ambientLight, settings.directionalLight, settings.autoRotate]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.glb') && !file.name.endsWith('.gltf')) {
      toast.error('Only .glb and .gltf files supported');
      return;
    }

    try {
      toast.loading('Loading model...');
      const fileURL = URL.createObjectURL(file);
      const loader = new GLTFLoader();

      const oldModel = sceneRef.current.children.find((c) => c.userData.isModel);
      if (oldModel) sceneRef.current.remove(oldModel);

      loader.load(
        fileURL,
        (gltf) => {
          const model = gltf.scene;
          model.userData.isModel = true;
          model.castShadow = true;
          model.receiveShadow = true;

          // Replace materials with better ones
          model.traverse((node) => {
            if (node.isMesh) {
              node.castShadow = true;
              node.receiveShadow = true;

              if (node.material) {
                const materials = Array.isArray(node.material) ? node.material : [node.material];
                materials.forEach((oldMat, idx) => {
                  const newMat = new THREE.MeshStandardMaterial({
                    color: oldMat.color || 0xcccccc,
                    metalness: 0.3,
                    roughness: 0.4,
                    side: THREE.DoubleSide,
                    envMapIntensity: 1,
                  });

                  if (Array.isArray(node.material)) {
                    node.material[idx] = newMat;
                  } else {
                    node.material = newMat;
                  }
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

          sceneRef.current.add(model);

          const scaledSize = scaledBox.getSize(new THREE.Vector3());
          const maxScaledDim = Math.max(scaledSize.x, scaledSize.y, scaledSize.z);
          const distance = maxScaledDim * 2.5;

          cameraRef.current.position.set(distance * 0.5, distance * 0.3, distance);
          cameraRef.current.lookAt(0, 0, 0);
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();

          let triangles = 0;
          let materials = new Set();
          model.traverse((node) => {
            if (node.isMesh && node.geometry) {
              triangles += (node.geometry.index?.count || node.geometry.attributes.position.count) / 3;
              if (node.material) {
                if (Array.isArray(node.material)) {
                  node.material.forEach((m) => materials.add(m));
                } else {
                  materials.add(node.material);
                }
              }
            }
          });

          setModelInfo({
            name: file.name,
            triangles: Math.round(triangles),
            materials: materials.size,
            textures: gltf.parser.json?.textures?.length || 0,
            size: `${(file.size / 1048576).toFixed(2)} MB`,
          });

          setModelLoaded(true);
          toast.dismiss();
          toast.success('Model loaded with Sketchfab-like rendering!');
          URL.revokeObjectURL(fileURL);
        },
        undefined,
        () => {
          toast.dismiss();
          toast.error('Failed to load model');
        }
      );
    } catch {
      toast.error('Error loading file');
    }
  };

  const exportSettings = () => {
    const json = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('Settings copied to clipboard!');
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    toast.success('Reset to defaults');
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Toaster position="top-right" />

      {/* Viewer */}
      <div className="flex-1 relative">
        <div ref={container} className="w-full h-screen" />
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/20 rounded-lg p-4">
          <h1 className="text-2xl font-bold text-[#12CE6A] mb-2">🎨 Model Viewer (Sketchfab Quality)</h1>
          <p className="text-sm text-gray-300">Drag to rotate • Scroll to zoom</p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="w-96 bg-black/80 border-l border-white/20 p-6 overflow-y-auto space-y-6 max-h-screen">
        <div>
          <h2 className="text-xl font-bold text-[#12CE6A] mb-4">Upload Model</h2>
          <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#12CE6A]">
            <div className="text-center">
              <div className="text-3xl mb-2">📁</div>
              <p className="text-sm font-semibold">Click to upload</p>
              <p className="text-xs text-gray-400 mt-1">.glb, .gltf</p>
            </div>
            <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        {modelLoaded && (
          <>
            {/* Model Info */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
              <h3 className="font-bold text-[#12CE6A]">📊 Model Info</h3>
              <div className="text-sm space-y-1">
                <p><span className="text-gray-400">File:</span> {modelInfo.name}</p>
                <p><span className="text-gray-400">Size:</span> {modelInfo.size}</p>
                <p><span className="text-gray-400">Triangles:</span> {modelInfo.triangles.toLocaleString()}</p>
                <p><span className="text-gray-400">Materials:</span> {modelInfo.materials}</p>
              </div>
            </div>

            {/* Bloom Settings */}
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
                    <label className="block text-xs font-semibold mb-1">Strength: {settings.bloom.strength.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="3"
                      step="0.1"
                      value={settings.bloom.strength}
                      onChange={(e) => setSettings({ ...settings, bloom: { ...settings.bloom, strength: parseFloat(e.target.value) } })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Radius: {settings.bloom.radius.toFixed(1)}</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={settings.bloom.radius}
                      onChange={(e) => setSettings({ ...settings, bloom: { ...settings.bloom, radius: parseFloat(e.target.value) } })}
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
                      onChange={(e) => setSettings({ ...settings, bloom: { ...settings.bloom, threshold: parseFloat(e.target.value) } })}
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

            {/* Lighting */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
              <h3 className="font-bold text-[#12CE6A]">💡 Lighting</h3>
              <div>
                <label className="block text-xs font-semibold mb-1">Ambient: {settings.ambientLight.toFixed(1)}</label>
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
              <div>
                <label className="block text-xs font-semibold mb-1">Directional: {settings.directionalLight.toFixed(1)}</label>
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
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoRotate}
                  onChange={(e) => setSettings({ ...settings, autoRotate: e.target.checked })}
                />
                <span className="text-sm">Auto Rotate</span>
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
        )}
      </div>
    </div>
  );
}
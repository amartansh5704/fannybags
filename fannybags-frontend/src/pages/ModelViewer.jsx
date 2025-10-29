import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function ModelViewer() {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [modelInfo, setModelInfo] = useState({
    name: 'None',
    triangles: 0,
    materials: 0,
    textures: 0,
    size: '0 MB',
  });
  const [lighting, setLighting] = useState({
    ambientIntensity: 0.7,
    directionalIntensity: 0.8,
    autoRotate: true,
  });

  // Initialize Three.js scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0033);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, lighting.ambientIntensity);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, lighting.directionalIntensity);
    directionalLight.position.set(10, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Grid helper
    const gridHelper = new THREE.GridHelper(20, 20);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = lighting.autoRotate;
    controls.autoRotateSpeed = 5;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, );

  // Update lighting
  useEffect(() => {
    if (!sceneRef.current) return;

    const ambientLight = sceneRef.current.children.find((child) => child instanceof THREE.AmbientLight);
    if (ambientLight) {
      ambientLight.intensity = lighting.ambientIntensity;
    }

    const directionalLight = sceneRef.current.children.find((child) => child instanceof THREE.DirectionalLight);
    if (directionalLight) {
      directionalLight.intensity = lighting.directionalIntensity;
    }

    if (controlsRef.current) {
      controlsRef.current.autoRotate = lighting.autoRotate;
    }
  }, [lighting]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isGLB = file.name.endsWith('.glb');
    const isGLTF = file.name.endsWith('.gltf');
    const isJSON = file.name.endsWith('.json');

    if (!isGLB && !isGLTF && !isJSON) {
      toast.error('Only .glb, .gltf, and .json files are supported');
      return;
    }

    try {
      toast.loading('Loading model...');

      const fileURL = URL.createObjectURL(file);
      const loader = new GLTFLoader();

      // Clear previous model
      const oldModel = sceneRef.current.children.find(
        (child) => child.userData.isModel
      );
      if (oldModel) {
        sceneRef.current.remove(oldModel);
      }

      loader.load(
        fileURL,
        (gltf) => {
          console.log('Model loaded:', gltf);
          const model = gltf.scene;
          model.userData.isModel = true;

          // Calculate model bounds
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());
          console.log('Model size:', size, 'Center:', center);

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 10 / maxDim; // Increased scale

          model.scale.multiplyScalar(scale);
          
          // Center the model properly
          const scaledCenter = center.clone().multiplyScalar(scale);
          model.position.sub(scaledCenter);

          sceneRef.current.add(model);
          console.log('Model added to scene');

          // Update camera - much further back
          const distance = maxDim * scale * 3;
          cameraRef.current.position.set(distance, distance * 0.7, distance);
          cameraRef.current.lookAt(0, 0, 0);
          
          if (controlsRef.current) {
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
          }

          console.log('Camera position:', cameraRef.current.position);

          // Count geometry and materials
          let triangles = 0;
          let materials = new Set();
          model.traverse((node) => {
            if (node.isMesh && node.geometry) {
              if (node.geometry.index) {
                triangles += node.geometry.index.count / 3;
              } else {
                triangles += node.geometry.attributes.position.count / 3;
              }
              if (node.material) {
                materials.add(node.material);
              }
            }
          });

          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

          setModelInfo({
            name: file.name,
            triangles: Math.round(triangles),
            materials: materials.size,
            textures: gltf.parser.json?.textures?.length || 0,
            size: `${fileSizeMB} MB`,
          });

          setModelLoaded(true);
          toast.dismiss();
          toast.success('Model loaded successfully!');
          URL.revokeObjectURL(fileURL);
        },
        (progress) => {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          toast.loading(`Loading... ${percent}%`);
        },
        (error) => {
          toast.dismiss();
          toast.error('Failed to load model');
          console.error(error);
          URL.revokeObjectURL(fileURL);
        }
      );
    } catch (err) {
      toast.error('Error loading file');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#50207A] via-[#1a0033] to-[#0a001a] text-white">
      <Toaster position="top-right" />

      <div className="flex h-screen">
        {/* Viewer */}
        <div className="flex-1 relative">
          <div ref={containerRef} className="w-full h-full" />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-white/10 rounded-lg p-4">
            <h1 className="text-2xl font-bold text-[#12CE6A] mb-2">📦 3D Model Viewer</h1>
            <p className="text-sm text-gray-300">Drag to rotate • Scroll to zoom</p>
          </div>
        </div>

        {/* Control Panel */}
        <div className="w-80 bg-black/40 border-l border-white/10 p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-xl font-bold text-[#12CE6A] mb-4">Upload Model</h2>
            <label className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#12CE6A] transition-all">
              <div className="text-center">
                <div className="text-3xl mb-2">📁</div>
                <p className="text-sm font-semibold">Click to upload</p>
                <p className="text-xs text-gray-400 mt-1">.glb, .gltf, .json</p>
              </div>
              <input
                type="file"
                accept=".glb,.gltf,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {modelLoaded && (
            <>
              {/* Model Info */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-2">
                <h3 className="font-bold text-[#12CE6A]">📊 Model Info</h3>
                <div className="text-sm space-y-2">
                  <div>
                    <p className="text-gray-400">File</p>
                    <p className="truncate">{modelInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Size</p>
                    <p>{modelInfo.size}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Triangles</p>
                    <p>{modelInfo.triangles.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Materials</p>
                    <p>{modelInfo.materials}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Textures</p>
                    <p>{modelInfo.textures}</p>
                  </div>
                </div>
              </div>

              {/* Quality Rating */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <h3 className="font-bold text-[#12CE6A]">⭐ Quality Metrics</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Polygon Count</span>
                      <span className={modelInfo.triangles > 100000 ? 'text-green-400' : modelInfo.triangles > 50000 ? 'text-yellow-400' : 'text-orange-400'}>
                        {modelInfo.triangles > 100000 ? 'High' : modelInfo.triangles > 50000 ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#12CE6A] to-[#FF48B9] h-2 rounded-full"
                        style={{ width: `${Math.min((modelInfo.triangles / 150000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Texture Quality</span>
                      <span className={modelInfo.textures > 5 ? 'text-green-400' : modelInfo.textures > 2 ? 'text-yellow-400' : 'text-orange-400'}>
                        {modelInfo.textures > 5 ? 'Rich' : modelInfo.textures > 2 ? 'Good' : 'Basic'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#12CE6A] to-[#FF48B9] h-2 rounded-full"
                        style={{ width: `${Math.min((modelInfo.textures / 8) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Material Variety</span>
                      <span className={modelInfo.materials > 10 ? 'text-green-400' : modelInfo.materials > 5 ? 'text-yellow-400' : 'text-orange-400'}>
                        {modelInfo.materials > 10 ? 'Complex' : modelInfo.materials > 5 ? 'Good' : 'Basic'}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#12CE6A] to-[#FF48B9] h-2 rounded-full"
                        style={{ width: `${Math.min((modelInfo.materials / 15) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Lighting Controls */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
            <h3 className="font-bold text-[#12CE6A]">💡 Lighting</h3>

            <div>
              <label className="block text-sm font-semibold mb-2">Ambient Light</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lighting.ambientIntensity}
                onChange={(e) => setLighting({ ...lighting, ambientIntensity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{lighting.ambientIntensity.toFixed(1)}</span>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Directional Light</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={lighting.directionalIntensity}
                onChange={(e) => setLighting({ ...lighting, directionalIntensity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <span className="text-xs text-gray-400">{lighting.directionalIntensity.toFixed(1)}</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lighting.autoRotate}
                onChange={(e) => setLighting({ ...lighting, autoRotate: e.target.checked })}
              />
              <span className="text-sm">Auto Rotate</span>
            </label>
          </div>

          {/* Tips */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm space-y-2">
            <h3 className="font-bold text-[#12CE6A] mb-2">💡 Comparison Tips</h3>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>✓ Higher polygon count = more detail</li>
              <li>✓ More textures = better realism</li>
              <li>✓ More materials = complex shading</li>
              <li>✓ Watch for smooth lighting transitions</li>
              <li>✓ Check shadow details & reflections</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
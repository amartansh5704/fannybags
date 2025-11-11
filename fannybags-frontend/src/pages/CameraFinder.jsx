import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function CameraFinder() {
  const mountRef = useRef(null);
  const [positions, setPositions] = useState({});
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a0033);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // OrbitControls for mouse interaction
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false;

    // Load GLB model
    const loader = new GLTFLoader();
    const modelPath = '/models/musicstudio.glb';

    console.log('Loading model from:', modelPath);

    loader.load(
      modelPath,
      (gltf) => {
        if (!gltf.scene) {
          console.error('❌ No scene in GLTF');
          return;
        }

        const model = gltf.scene;
        scene.add(model);

        // Auto-frame the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        console.log('✅ Model loaded successfully');
        console.log('Model size:', size);
        console.log('Center:', center);

        camera.position.copy(center);
        camera.position.z += size.z * 0.8;
        controls.target.copy(center);
        controls.update();
      },
      (progress) => {
        console.log('Loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
      },
      (error) => {
        console.error('❌ Failed to load model:');
        console.error('Error:', error);
        console.error('Check if file exists at:', modelPath);
      }
    );

    // Keyboard listeners for saving positions
    const handleKeyDown = (e) => {
      if (e.key >= '1' && e.key <= '5') {
        const checkpoint = parseInt(e.key);
        const pos = camera.position;
        const newPositions = {
          ...positions,
          [checkpoint]: {
            position: [pos.x, pos.y, pos.z],
            target: [controls.target.x, controls.target.y, controls.target.z],
          },
        };
        setPositions(newPositions);
        setCurrentCheckpoint(checkpoint);
        console.log(`✅ Checkpoint ${checkpoint} saved:`, pos);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [positions]);

  return (
    <div>
      <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />

      {/* UI Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 20,
          left: 20,
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          fontFamily: 'monospace',
          fontSize: '14px',
          maxWidth: '400px',
          zIndex: 100,
        }}
      >
        <h2 style={{ marginTop: 0 }}>📷 Camera Position Finder</h2>

        <p style={{ marginBottom: '10px', color: '#12CE6A', fontWeight: 'bold' }}>
          ✅ Loading: music_studio_at_home.glb
        </p>

        <p style={{ marginBottom: '10px', color: '#999' }}>
          🖱️ Use mouse to rotate/pan
        </p>
        <p style={{ marginBottom: '15px', color: '#999' }}>
          Press <strong>1-5</strong> to save checkpoint positions
        </p>

        <div style={{ marginTop: '20px', borderTop: '1px solid #555', paddingTop: '15px' }}>
          <h3 style={{ marginTop: 0, color: '#12CE6A' }}>Saved Positions:</h3>

          {Object.keys(positions).length === 0 ? (
            <p style={{ color: '#999' }}>None yet...</p>
          ) : (
            <div>
              {Object.entries(positions).map(([checkpoint, data]) => (
                <div
                  key={checkpoint}
                  style={{
                    background: currentCheckpoint === parseInt(checkpoint) ? '#12CE6A22' : 'transparent',
                    padding: '10px',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    border: '1px solid #12CE6A',
                  }}
                >
                  <strong>Checkpoint {checkpoint}:</strong>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    Position: [{data.position[0].toFixed(2)}, {data.position[1].toFixed(2)}, {data.position[2].toFixed(2)}]
                  </p>
                  <p style={{ margin: '5px 0', fontSize: '12px' }}>
                    Target: [{data.target[0].toFixed(2)}, {data.target[1].toFixed(2)}, {data.target[2].toFixed(2)}]
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {Object.keys(positions).length > 0 && (
          <button
            onClick={() => {
              const json = JSON.stringify(positions, null, 2);
              console.log('📋 COPY THIS JSON:\n', json);
              alert('Check console for JSON. Copy and paste to Claude.');
            }}
            style={{
              marginTop: '15px',
              padding: '10px 15px',
              background: '#12CE6A',
              color: '#50207A',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: '100%',
            }}
          >
            📋 Copy JSON to Console
          </button>
        )}
      </div>
    </div>
  );
}
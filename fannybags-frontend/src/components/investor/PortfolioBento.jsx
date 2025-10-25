import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import '../../components/reactbits/components/MagicBento.css';

const PortfolioBento = ({ portfolio, holdings, walletData }) => {
  const gridRef = useRef(null);
  const spotlightRef = useRef(null);

  // FannyBags branded color (RGB format for CSS)
  const glowColor = '255, 72, 185'; // #FF48B9
  const spotlightRadius = 300;

  // Simplified spotlight effect
  useEffect(() => {
    const spotlight = document.createElement('div');
    spotlight.className = 'global-spotlight';
    spotlight.style.cssText = `
      position: fixed;
      width: 800px;
      height: 800px;
      border-radius: 50%;
      pointer-events: none;
      background: radial-gradient(circle,
        rgba(${glowColor}, 0.15) 0%,
        rgba(${glowColor}, 0.08) 15%,
        rgba(${glowColor}, 0.04) 25%,
        transparent 70%
      );
      z-index: 200;
      opacity: 0;
      transform: translate(-50%, -50%);
      mix-blend-mode: screen;
    `;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;

    const handleMouseMove = (e) => {
      if (!spotlightRef.current || !gridRef.current) return;

      const section = gridRef.current;
      const rect = section.getBoundingClientRect();
      const mouseInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        return;
      }

      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        opacity: 0.8,
        duration: 0.2,
        ease: 'power2.out'
      });

      // Update card glow
      const cards = gridRef.current.querySelectorAll('.card');
      cards.forEach(card => {
        const cardRect = card.getBoundingClientRect();
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        
        const glowIntensity = Math.max(0, 1 - distance / spotlightRadius);
        
        const relativeX = ((e.clientX - cardRect.left) / cardRect.width) * 100;
        const relativeY = ((e.clientY - cardRect.top) / cardRect.height) * 100;

        card.style.setProperty('--glow-x', `${relativeX}%`);
        card.style.setProperty('--glow-y', `${relativeY}%`);
        card.style.setProperty('--glow-intensity', glowIntensity.toString());
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [glowColor, spotlightRadius]);

  return (
    <div className="card-grid bento-section" ref={gridRef}>
      {/* Card 1: Total Invested */}
      <div
        className="card card--border-glow"
        style={{
          backgroundColor: '#060010',
          '--glow-color': glowColor,
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': 0,
          '--glow-radius': '200px'
        }}
      >
        <div className="card__header">
          <div className="card__label">Portfolio</div>
        </div>
        <div className="card__content">
          <h2 className="card__title">Total Invested</h2>
          <p className="text-3xl font-bold text-fb-pink mt-2">
            ₹{portfolio?.total_invested?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Card 2: Total Earnings */}
      <div
        className="card card--border-glow"
        style={{
          backgroundColor: '#060010',
          '--glow-color': glowColor,
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': 0
        }}
      >
        <div className="card__header">
          <div className="card__label">Returns</div>
        </div>
        <div className="card__content">
          <h2 className="card__title">Total Earnings</h2>
          <p className="text-3xl font-bold text-fb-green mt-2">
            ₹{portfolio?.total_earnings?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* Card 3: ROI - Large Card */}
      <div
        className="card card--border-glow"
        style={{
          backgroundColor: '#060010',
          '--glow-color': glowColor,
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': 0
        }}
      >
        <div className="card__header">
          <div className="card__label">Performance</div>
        </div>
        <div className="card__content">
          <h2 className="card__title">Overall ROI</h2>
          <p className="text-5xl font-bold text-white mt-4">
            {portfolio?.overall_roi?.toFixed(1) || '0'}%
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Across {portfolio?.number_of_campaigns || 0} campaigns
          </p>
        </div>
      </div>

      {/* Card 4: Wallet Balance - Large Card */}
      <div
        className="card card--border-glow"
        style={{
          backgroundColor: '#060010',
          '--glow-color': '18, 206, 106',
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': 0
        }}
      >
        <div className="card__header">
          <div className="card__label">Wallet</div>
        </div>
        <div className="card__content">
          <h2 className="card__title">Available Balance</h2>
          <p className="text-4xl font-bold text-fb-green mt-4">
            ₹{walletData?.balance?.toLocaleString() || '0'}
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div>
              <p className="text-gray-400">Deposited</p>
              <p className="font-semibold">₹{walletData?.total_deposited?.toLocaleString() || '0'}</p>
            </div>
            <div>
              <p className="text-gray-400">Withdrawn</p>
              <p className="font-semibold">₹{walletData?.total_withdrawn?.toLocaleString() || '0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card 5: Active Campaigns */}
      <div
        className="card card--border-glow"
        style={{
          backgroundColor: '#060010',
          '--glow-color': '80, 32, 122',
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': 0
        }}
      >
        <div className="card__header">
          <div className="card__label">Portfolio</div>
        </div>
        <div className="card__content">
          <h2 className="card__title">Active Campaigns</h2>
          <p className="text-3xl font-bold mt-2" style={{ color: '#50207A' }}>
            {holdings?.length || 0}
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Campaigns invested in
          </p>
        </div>
      </div>

      {/* Card 6: Expected Returns */}
      <div
        className="card card--border-glow"
        style={{
          backgroundColor: '#060010',
          '--glow-color': glowColor,
          '--glow-x': '50%',
          '--glow-y': '50%',
          '--glow-intensity': 0
        }}
      >
        <div className="card__header">
          <div className="card__label">Forecast</div>
        </div>
        <div className="card__content">
          <h2 className="card__title">Expected (3M)</h2>
          <p className="text-2xl font-bold text-white mt-2">
            ₹{portfolio?.expected_returns_3m?.toLocaleString() || '0'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioBento;
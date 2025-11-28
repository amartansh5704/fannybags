import { useEffect } from 'react';


export default function DashboardTransition({ children, isTransitioning, onComplete }) {
  useEffect(() => {
    if (isTransitioning) {
      // Auto-complete after animation duration
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600); // Match animation duration

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, onComplete]);

  if (!isTransitioning) {
    return <>{children}</>;
  }

  return (
    // Simple fade instead of pixel effect
<div className="fixed inset-0 z-50 bg-[#0A0A0A] flex items-center justify-center opacity-0 animate-fade-in">
  <div className="text-center">
    <div className="text-6xl mb-4">🎵</div>
    <h2 className="text-3xl font-bold text-white">Loading Your Dashboard...</h2>
  </div>
</div>
  );
}
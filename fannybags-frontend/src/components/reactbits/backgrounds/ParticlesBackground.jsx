import './ParticlesBackground.css';

const ParticlesBackground = ({ 
  particleCount = 50,
  colors = ['#FF48B9', '#50207A', '#12CE6A'],
  className = ''
}) => {
  return (
    <div className={`particles-bg ${className}`}>
      {Array.from({ length: particleCount }).map((_, i) => {
        const size = Math.random() * 4 + 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const animationDuration = Math.random() * 15 + 10;
        const animationDelay = Math.random() * 5;
        
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              background: color,
              left: `${left}%`,
              animationDuration: `${animationDuration}s`,
              animationDelay: `${animationDelay}s`,
              boxShadow: `0 0 ${size * 3}px ${color}`
            }}
          />
        );
      })}
    </div>
  );
};

export default ParticlesBackground;
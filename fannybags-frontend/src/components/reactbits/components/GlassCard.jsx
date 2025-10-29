const GlassCard = ({
  children,
  className = '',
  blur = 'md',
  opacity = 10,
  border = true,
  glow = false,
  glowColor = 'pink',
  ...props
}) => {
  const blurClass = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }[blur] || 'backdrop-blur-md';

  const bgOpacity = `bg-white/${opacity}`;

  const glowClasses = {
    pink: 'hover:shadow-2xl hover:shadow-fb-pink/40',
    green: 'hover:shadow-2xl hover:shadow-fb-green/40',
    purple: 'hover:shadow-2xl hover:shadow-[#50207A]/40',
    none: ''
  }[glowColor] || '';

  return (
    <div
      className={`
        ${blurClass}
        ${bgOpacity}
        ${border ? 'border border-white/20' : ''}
        rounded-xl
        shadow-xl
        transition-all
        duration-300
        ${glow ? glowClasses : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
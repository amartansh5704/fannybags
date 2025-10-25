const GlassCard = ({ 
  children, 
  className = '',
  blur = 'md',
  opacity = 10,
  border = true,
  ...props 
}) => {
  const blurClass = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  }[blur] || 'backdrop-blur-md';

  const bgOpacity = `bg-white/${opacity}`;

  return (
    <div 
      className={`
        ${blurClass}
        ${bgOpacity}
        ${border ? 'border border-white/20' : ''}
        rounded-xl
        shadow-xl
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
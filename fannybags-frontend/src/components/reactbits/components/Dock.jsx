'use client';

import {
  motion as Motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence
} from 'motion/react';
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import './Dock.css';

function DockItem({
  children,
  className = '',
  onClick,
  mousePos,
  spring,
  distance,
  magnification,
  baseItemSize,
  orientation = 'horizontal'
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mousePos, (val) => {
    const rect =
      ref.current?.getBoundingClientRect() ?? {
        x: 0,
        y: 0,
        width: baseItemSize,
        height: baseItemSize
      };

    const center =
      orientation === 'horizontal'
        ? rect.x + rect.width / 2
        : rect.y + rect.height / 2;

    return val - center;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <Motion.div
      ref={ref}
      style={{
        width: size,
        height: size
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`dock-item ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup="true"
    >
      {Children.map(children, (child) => cloneElement(child, { isHovered }))}
    </Motion.div>
  );
}

function DockLabel({ children, className = '', ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <Motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`dock-label ${className}`}
          role="tooltip"
        >
          {children}
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = '' }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 70,
  distance = 200,
  panelHeight = 68,
  dockHeight = 256,
  baseItemSize = 50,
  orientation = 'horizontal'
}) {
  const mousePos = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const maxSize = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight]
  );

  const animatedSize = useTransform(
    isHovered,
    [0, 1],
    [panelHeight, maxSize]
  );
  const size = useSpring(animatedSize, spring);

  const outerStyle =
    orientation === 'horizontal'
      ? { height: size, scrollbarWidth: 'none' }
      : { width: size, scrollbarWidth: 'none' };

  return (
    <Motion.div style={outerStyle} className="dock-outer">
      <Motion.div
        onMouseMove={({ pageX, pageY }) => {
          isHovered.set(1);
          mousePos.set(orientation === 'horizontal' ? pageX : pageY);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mousePos.set(Infinity);
        }}
        className={`dock-panel ${className} ${
          orientation === 'vertical' ? 'dock-panel-vertical' : ''
        }`}
        style={
          orientation === 'horizontal'
            ? { height: panelHeight }
            : { width: panelHeight }
        }
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            onClick={item.onClick}
            className={item.className}
            mousePos={mousePos}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            orientation={orientation}
          >
            <DockIcon>{item.icon}</DockIcon>
            <DockLabel>{item.label}</DockLabel>
          </DockItem>
        ))}
      </Motion.div>
    </Motion.div>
  );
}

import { useRef } from 'react';
import { motion as Motion, useInView } from 'framer-motion';

const AnimatedItem = ({ children, delay = 0, index }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.3, once: true });
  
  return (
    <Motion.div
      ref={ref}
      data-index={index}
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.8, opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {children}
    </Motion.div>
  );
};

const AnimatedList = ({
  children,
  staggerDelay = 0.1,
  className = ''
}) => {
  const childrenArray = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <AnimatedItem key={index} delay={index * staggerDelay} index={index}>
          {child}
        </AnimatedItem>
      ))}
    </div>
  );
};

export default AnimatedList;
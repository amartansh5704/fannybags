import React, { useRef, useEffect } from "react";
import { motion as Motion, useMotionValue, useSpring } from "framer-motion";
import "./TiltedCard.css";

/**
 * TiltedCard - wrapper/component that adds full-card tilt, glow, spotlight and shimmer.
 * Usage: <TiltedCard><CampaignCard ... /></TiltedCard>
 *
 * Props:
 * - width / height: CSS values for wrapper sizing (defaults to 100% / auto)
 * - rotateAmplitude: max degrees for rotation (default 10)
 * - scaleOnHover: scale multiplier on hover (default 1.04)
 * - softGlow: whether to show glow (default true)
 * - shimmer: whether to show shimmer sweep (default true)
 */
export default function TiltedCard({
  children,
  width = "100%",
  height = "auto",
  rotateAmplitude = 10,
  scaleOnHover = 1.04,
  softGlow = true,
  shimmer = true,
  className = "",
}) {
  const rootRef = useRef(null);

  // raw motion values (not springs)
  const mx = useMotionValue(0); // pointer x relative to element (px)
  const my = useMotionValue(0); // pointer y relative
  const rx = useMotionValue(0); // rotateX (deg)
  const ry = useMotionValue(0); // rotateY (deg)
  const s = useMotionValue(1);   // scale

  // springed versions for smoother motion
  const springOpts = { damping: 20, stiffness: 200 };
  const sRx = useSpring(rx, springOpts);
  const sRy = useSpring(ry, springOpts);
  const sS = useSpring(s, springOpts);
  const sMx = useSpring(mx, { damping: 30, stiffness: 300 });
  const sMy = useSpring(my, { damping: 30, stiffness: 300 });

  // small helper to detect touch devices (disable tilt)
  const isTouch = typeof navigator !== "undefined" && ("maxTouchPoints" in navigator) && navigator.maxTouchPoints > 0;

  useEffect(() => {
    // ensure initial values
    s.set(1);
    rx.set(0);
    ry.set(0);
  }, []); // eslint-disable-line

  function handlePointerMove(e) {
    if (!rootRef.current || isTouch) return;
    const rect = rootRef.current.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    // distance from center normalized -1..1
    const nx = clamp((px - cx) / (rect.width / 2), -1, 1);
    const ny = clamp((py - cy) / (rect.height / 2), -1, 1);

    // rotate amplitude
    const rotX = ny * -rotateAmplitude; // invert for natural tilt
    const rotY = nx * rotateAmplitude;

    rx.set(rotX);
    ry.set(rotY);
    mx.set(px);
    my.set(py);
  }

  function handlePointerLeave() {
    // reset
    rx.set(0);
    ry.set(0);
    mx.set(0);
    my.set(0);
    s.set(1);
  }

  function handlePointerEnter() {
    if (isTouch) return;
    s.set(scaleOnHover);
  }

  // small clamp util
  function clamp(v, a, b) {
    return Math.min(Math.max(v, a), b);
  }

  // inline styles for spotlight position using springed mx/my
  const spotlightStyle = {
    // left/top must center the radial gradient; we translate to center later
    left: sMx,
    top: sMy,
  };

  return (
    <Motion.div
      ref={rootRef}
      className={`tilt-wrapper ${className}`}
      style={{ width, height }}
      onMouseMove={handlePointerMove}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onTouchStart={() => { /* disable tilt on touch, but still allow click */ }}
    >
      {/* Soft glow behind the card */}
      {softGlow && <div className="tilt-glow" aria-hidden />}

      {/* spotlight (follows cursor) */}
      <Motion.div
        className="tilt-spotlight"
        style={{
          ...spotlightStyle,
          // center the radial by translating by -50% using transform (Motion accepts transform style)
          translateX: "-50%",
          translateY: "-50%",
        }}
        aria-hidden
      />

      {/* shimmer sweep */}
      {shimmer && <div className="tilt-shimmer" aria-hidden />}

      {/* actual interactive inner card - reacts to rotate & scale */}
      <Motion.div
        className="tilt-inner"
        style={{
          rotateX: sRx,
          rotateY: sRy,
          scale: sS,
          transformStyle: "preserve-3d",
        }}
      >
        {/* CONTENT: render children (the existing CampaignCard) */}
        <div className="tilt-content">
          {children}
        </div>
      </Motion.div>
    </Motion.div>
  );
}

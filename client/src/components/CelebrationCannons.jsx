import { useMemo, useEffect, useRef } from 'react';

const COLORS = ['#e91e63', '#ffc107', '#2196f3', '#4caf50', '#ff5722', '#9c27b0', '#00bcd4'];
const PER_SIDE = 40;

function makePieces(side, duration) {
  const spread = Math.max(0.15, duration - 2.4);
  const count = Math.round(PER_SIDE * Math.max(1, spread / 0.8));
  return Array.from({ length: count }, (_, i) => {
    const dir = side === 'left' ? 1 : -1;
    return {
      key: `${side}-${i}`,
      side,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      dx: dir * (80 + Math.random() * 55), // vw
      dy: -(25 + Math.random() * 45),      // vh
      rot: Math.random() * 900 - 450,
      delay: Math.random() * spread,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 8,
    };
  });
}

export default function CelebrationCannons({ name, message, duration = 3.2, onDone }) {
  const pieces = useMemo(
    () => [...makePieces('left', duration), ...makePieces('right', duration)],
    [duration]
  );

  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const id = setTimeout(() => doneRef.current?.(), duration * 1000);
    return () => clearTimeout(id);
  }, [duration]);

  return (
    <div className="celebration" aria-live="polite">
      <div className="cannon cannon-left">🎉</div>
      <div className="cannon cannon-right">🎉</div>
      {pieces.map(p => (
        <span
          key={p.key}
          className={`confetti confetti-${p.side}`}
          style={{
            background: p.color,
            width: p.w,
            height: p.h,
            animationDelay: `${p.delay}s`,
            '--dx': `${p.dx}vw`,
            '--dy': `${p.dy}vh`,
            '--rot': `${p.rot}deg`,
          }}
        />
      ))}
      <div className="celebration-msg" dir="rtl" style={{ animationDuration: `${duration}s` }}>
        {message || `أهيه ـ ${name} ـ ذاك طايب`}
      </div>
    </div>
  );
}

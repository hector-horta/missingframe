import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  decay: number;
}

interface CelebrationCanvasProps {
  active: boolean;
  onComplete?: () => void;
}

export const CelebrationCanvas: React.FC<CelebrationCanvasProps> = ({ active, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    const colors = [
      'rgba(212, 175, 55, 0.85)', // Gold
      'rgba(243, 207, 101, 0.9)',  // Light Gold
      'rgba(255, 255, 255, 0.95)', // White sparks
      'rgba(218, 62, 82, 0.75)'    // Crimson sparks
    ];

    const spawnSparks = (x: number, y: number, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - (Math.random() * 3),
          alpha: 1,
          size: Math.random() * 3 + 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: Math.random() * 0.015 + 0.01
        });
      }
    };

    spawnSparks(canvas.width / 2, canvas.height / 2, 150);
    spawnSparks(canvas.width * 0.25, canvas.height * 0.75, 80);
    spawnSparks(canvas.width * 0.75, canvas.height * 0.75, 80);

    const floatInterval = setInterval(() => {
      for (let i = 0; i < 4; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + 10,
          vx: (Math.random() - 0.5) * 2,
          vy: -(Math.random() * 4 + 2),
          alpha: 1,
          size: Math.random() * 2.5 + 0.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          decay: Math.random() * 0.01 + 0.005
        });
      }
    }, 50);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        if (p.color.includes('212') || p.color.includes('243')) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    const timeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 6000);

    return () => {
      clearInterval(floatInterval);
      clearTimeout(timeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [active, onComplete]);

  if (!active) return null;

  return <canvas ref={canvasRef} className="fixed inset-0 z-[999] pointer-events-none" />;
};

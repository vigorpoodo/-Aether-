import React, { useRef, useEffect } from 'react';
import { AetherState, Mood, VisualParams } from '../types';

interface Props {
  state: AetherState;
}

// Map Moods to Visual Parameters
const getVisualParams = (mood: Mood): VisualParams => {
  switch (mood) {
    case Mood.HAPPY: return { primaryColor: '#facc15', secondaryColor: '#fb923c', speed: 0.008, noise: 0.3, pulseRate: 0.02 };
    case Mood.EXCITED: return { primaryColor: '#22d3ee', secondaryColor: '#e879f9', speed: 0.02, noise: 0.6, pulseRate: 0.05 };
    case Mood.SAD: return { primaryColor: '#475569', secondaryColor: '#3b82f6', speed: 0.002, noise: 0.1, pulseRate: 0.005 };
    case Mood.ANXIOUS: return { primaryColor: '#fb7185', secondaryColor: '#f43f5e', speed: 0.015, noise: 1.5, pulseRate: 0.08 };
    case Mood.ANGRY: return { primaryColor: '#dc2626', secondaryColor: '#7f1d1d', speed: 0.01, noise: 0.8, pulseRate: 0.01 };
    case Mood.TIRED: return { primaryColor: '#94a3b8', secondaryColor: '#64748b', speed: 0.001, noise: 0.1, pulseRate: 0.002 };
    case Mood.NEUTRAL:
    default: return { primaryColor: '#38bdf8', secondaryColor: '#818cf8', speed: 0.005, noise: 0.4, pulseRate: 0.01 };
  }
};

const AetherVisualizer: React.FC<Props> = ({ state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<number>(0);
  const requestRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const params = getVisualParams(state.mood);
    
    // Adjust params based on energy/coherence
    const adjustedSpeed = params.speed * (0.5 + state.energyLevel);
    const adjustedNoise = params.noise * (2.0 - state.coherence); // Less coherence = more noise

    const render = () => {
      // Resize handling logic simplified for loop
      if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
      
      const { width, height } = canvas;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.3;

      // Clear
      ctx.clearRect(0, 0, width, height);
      
      // Update Time
      timeRef.current += adjustedSpeed;
      const t = timeRef.current;

      // Create Gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 1.5);
      gradient.addColorStop(0, params.primaryColor);
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      
      // Draw Blob
      ctx.beginPath();
      const numPoints = 100; // Resolution of the blob
      
      for (let i = 0; i <= numPoints; i++) {
        const angle = (Math.PI * 2 * i) / numPoints;
        
        // Organic shape formula using superimposed sine waves
        // The 'noise' factor distorts the circle
        const offset = 
          Math.sin(angle * 3 + t) * 20 * adjustedNoise +
          Math.cos(angle * 5 - t * 2) * 15 * adjustedNoise +
          Math.sin(angle * 7 + t * 0.5) * 10;

        // Pulse effect
        const pulse = Math.sin(t * 10) * (radius * params.pulseRate * 10);
        
        const r = radius + offset + pulse;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.closePath();
      ctx.fill();

      // Glow effect
      ctx.shadowBlur = 40;
      ctx.shadowColor = params.secondaryColor;
      ctx.stroke();
      ctx.strokeStyle = params.secondaryColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 0; // Reset

      requestRef.current = requestAnimationFrame(render);
    };

    requestRef.current = requestAnimationFrame(render);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [state]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full absolute top-0 left-0 z-0 pointer-events-none opacity-80"
    />
  );
};

export default AetherVisualizer;
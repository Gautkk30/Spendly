import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { DEFAULT_APPEARANCE, AppearanceConfig } from '../types';

interface AuroraBackgroundProps {
  theme: 'light' | 'dark' | 'midnight' | 'forest' | 'sunset' | 'amethyst';
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ theme }) => {
  const { user } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Load user's appearance settings with default fallbacks
  const settings: AppearanceConfig = {
    ...DEFAULT_APPEARANCE,
    ...(user?.appearanceSettings || {}),
  };

  const {
    backgroundTheme,
    animationIntensity,
    auroraSpeed,
    backgroundOpacity,
    blurStrength,
  } = settings;

  // Responsive device checks
  useEffect(() => {
    const mediaMobile = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaMobile.matches);
    const listenerMobile = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaMobile.addEventListener('change', listenerMobile);

    const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaMotion.matches);
    const listenerMotion = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaMotion.addEventListener('change', listenerMotion);

    return () => {
      mediaMobile.removeEventListener('change', listenerMobile);
      mediaMotion.removeEventListener('change', listenerMotion);
    };
  }, []);

  // Compute animation speeds based on configuration
  const getSpeedMultiplier = () => {
    if (auroraSpeed === 'fast') return 0.4;
    if (auroraSpeed === 'normal') return 0.8;
    return 1.4; // slow (default)
  };

  // Determine if animation should run
  const isAnimated =
    animationIntensity !== 'off' &&
    !reducedMotion &&
    (!isMobile || animationIntensity === 'high'); // scale down on mobile

  // Map blur strength to filter strings
  const getBlurClass = () => {
    if (blurStrength === 'low') return 'blur-xl';
    if (blurStrength === 'medium') return 'blur-3xl';
    return 'blur-[110px]'; // High
  };

  // 1. Aurora Blobs Color Scheme
  const getAuroraColors = () => {
    switch (theme) {
      case 'light':
        return {
          blob1: 'bg-emerald-500/15',
          blob2: 'bg-violet-500/15',
          blob3: 'bg-indigo-500/10',
          blob4: 'bg-rose-500/15',
        };
      case 'midnight':
        return {
          blob1: 'bg-cyan-500/12',
          blob2: 'bg-blue-600/10',
          blob3: 'bg-indigo-500/12',
          blob4: 'bg-violet-600/10',
        };
      case 'forest':
        return {
          blob1: 'bg-emerald-500/12',
          blob2: 'bg-teal-500/12',
          blob3: 'bg-green-600/10',
          blob4: 'bg-cyan-600/8',
        };
      case 'sunset':
        return {
          blob1: 'bg-rose-500/12',
          blob2: 'bg-orange-500/10',
          blob3: 'bg-amber-500/10',
          blob4: 'bg-purple-600/12',
        };
      case 'amethyst':
        return {
          blob1: 'bg-purple-500/15',
          blob2: 'bg-fuchsia-500/12',
          blob3: 'bg-indigo-600/15',
          blob4: 'bg-violet-500/12',
        };
      case 'dark':
      default:
        return {
          blob1: 'bg-emerald-500/10',
          blob2: 'bg-violet-600/12',
          blob3: 'bg-indigo-500/10',
          blob4: 'bg-teal-600/8',
        };
    }
  };

  // 2. Mesh Gradient Colors (contrasting but themed)
  const getMeshColors = () => {
    switch (theme) {
      case 'light':
        return {
          blob1: 'bg-sky-400/20',
          blob2: 'bg-indigo-300/20',
          blob3: 'bg-pink-300/15',
        };
      case 'midnight':
        return {
          blob1: 'bg-teal-500/12',
          blob2: 'bg-indigo-600/12',
          blob3: 'bg-blue-500/12',
        };
      case 'forest':
        return {
          blob1: 'bg-emerald-600/12',
          blob2: 'bg-amber-500/10',
          blob3: 'bg-teal-500/12',
        };
      case 'sunset':
        return {
          blob1: 'bg-rose-500/15',
          blob2: 'bg-yellow-500/10',
          blob3: 'bg-purple-500/12',
        };
      case 'amethyst':
        return {
          blob1: 'bg-fuchsia-500/15',
          blob2: 'bg-blue-600/15',
          blob3: 'bg-violet-500/15',
        };
      case 'dark':
      default:
        return {
          blob1: 'bg-teal-500/10',
          blob2: 'bg-indigo-500/12',
          blob3: 'bg-violet-500/10',
        };
    }
  };

  // Render static pure dark solid backgrounds
  if (backgroundTheme === 'pure-dark') {
    const getPureDarkClass = () => {
      if (theme === 'light') return 'bg-white';
      if (theme === 'midnight') return 'bg-[#050811]';
      if (theme === 'forest') return 'bg-[#040605]';
      if (theme === 'sunset') return 'bg-[#090506]';
      if (theme === 'amethyst') return 'bg-[#06040a]';
      return 'bg-zinc-950';
    };
    return <div className={`absolute inset-0 transition-all duration-700 z-0 ${getPureDarkClass()}`} id="app-bg-pure-dark" />;
  }

  // Render static minimal gradients
  if (backgroundTheme === 'minimal') {
    const getMinimalGradientClass = () => {
      if (theme === 'light') return 'bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-100';
      if (theme === 'midnight') return 'bg-gradient-to-br from-[#0c1224] via-[#050811] to-[#0d1326]';
      if (theme === 'forest') return 'bg-gradient-to-br from-[#0e1711] via-[#040605] to-[#101913]';
      if (theme === 'sunset') return 'bg-gradient-to-br from-[#1d1015] via-[#090506] to-[#201217]';
      if (theme === 'amethyst') return 'bg-gradient-to-br from-[#140e21] via-[#06040a] to-[#160f25]';
      return 'bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950';
    };
    return <div className={`absolute inset-0 transition-all duration-700 z-0 ${getMinimalGradientClass()}`} id="app-bg-minimal" />;
  }

  // Render Glass Theme background
  if (backgroundTheme === 'glass') {
    const getGlassBase = () => {
      if (theme === 'light') return 'bg-zinc-50/50';
      if (theme === 'midnight') return 'bg-[#070b16]/70';
      if (theme === 'forest') return 'bg-[#060a08]/70';
      if (theme === 'sunset') return 'bg-[#10090b]/70';
      if (theme === 'amethyst') return 'bg-[#0a0711]/70';
      return 'bg-zinc-950/70';
    };

    const getGlowColor = () => {
      if (theme === 'light') return 'from-zinc-200/40 to-transparent';
      if (theme === 'midnight') return 'from-blue-500/5 to-transparent';
      if (theme === 'forest') return 'from-emerald-500/5 to-transparent';
      if (theme === 'sunset') return 'from-rose-500/5 to-transparent';
      if (theme === 'amethyst') return 'from-purple-500/5 to-transparent';
      return 'from-emerald-500/5 to-transparent';
    };

    return (
      <div className={`absolute inset-0 transition-all duration-700 z-0 ${getGlassBase()}`} id="app-bg-glass">
        {/* Soft elegant static lights */}
        <div className={`absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-b ${getGlowColor()} filter blur-[100px]`} />
        <div className={`absolute -bottom-40 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-t ${getGlowColor()} filter blur-[100px]`} />
        {/* Noise overlay */}
        <div className="absolute inset-0 opacity-[0.015] bg-noise pointer-events-none" />
      </div>
    );
  }

  // Render flowing Mesh Gradient Theme
  if (backgroundTheme === 'mesh') {
    const meshColors = getMeshColors();
    const speedMult = getSpeedMultiplier();

    return (
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none z-0 transition-all duration-700" 
        style={{ opacity: backgroundOpacity / 100 }}
        id="app-bg-mesh"
      >
        <motion.div
          animate={isAnimated ? {
            x: [0, 100, -80, 0],
            y: [0, -120, 90, 0],
            rotate: [0, 120, 240, 360]
          } : undefined}
          transition={{
            duration: 35 * speedMult,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`absolute top-[-20%] left-[-10%] w-[80vw] h-[80vh] rounded-full filter ${getBlurClass()} ${meshColors.blob1} mix-blend-screen opacity-80`}
        />

        <motion.div
          animate={isAnimated ? {
            x: [0, -90, 110, 0],
            y: [0, 100, -110, 0],
            rotate: [360, 240, 120, 0]
          } : undefined}
          transition={{
            duration: 40 * speedMult,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={`absolute bottom-[-15%] right-[-10%] w-[75vw] h-[75vh] rounded-full filter ${getBlurClass()} ${meshColors.blob2} mix-blend-screen opacity-80`}
        />

        {animationIntensity !== 'low' && (
          <motion.div
            animate={isAnimated ? {
              x: [0, 120, -100, 0],
              y: [0, 80, -90, 0],
              scale: [1, 1.15, 0.9, 1]
            } : undefined}
            transition={{
              duration: 32 * speedMult,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={`absolute top-[25%] left-[20%] w-[65vw] h-[65vh] rounded-full filter ${getBlurClass()} ${meshColors.blob3} mix-blend-screen opacity-70`}
          />
        )}
      </div>
    );
  }

  // Render traditional Aurora Theme (Default)
  const colors = getAuroraColors();
  const speed = getSpeedMultiplier();

  return (
    <div 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0 transition-all duration-700"
      style={{ opacity: backgroundOpacity / 100 }}
      id="app-bg-aurora"
    >
      {/* Blob 1 */}
      <motion.div
        animate={isAnimated ? {
          x: [0, 80, -60, 0],
          y: [0, -90, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        } : undefined}
        transition={{
          duration: 25 * speed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full filter ${getBlurClass()} ${colors.blob1}`}
      />

      {/* Blob 2 */}
      <motion.div
        animate={isAnimated ? {
          x: [0, -70, 90, 0],
          y: [0, 80, -70, 0],
          scale: [1, 0.9, 1.15, 1],
        } : undefined}
        transition={{
          duration: 30 * speed,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full filter ${getBlurClass()} ${colors.blob2}`}
      />

      {/* Blob 3 (Render on Medium or High intensity) */}
      {animationIntensity !== 'low' && (
        <motion.div
          animate={isAnimated ? {
            x: [0, 100, -80, 0],
            y: [0, 60, -90, 0],
            scale: [1, 1.1, 0.85, 1],
          } : undefined}
          transition={{
            duration: 28 * speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full filter ${getBlurClass()} ${colors.blob3}`}
        />
      )}

      {/* Blob 4 (Render on High intensity only) */}
      {animationIntensity === 'high' && (
        <motion.div
          animate={isAnimated ? {
            x: [0, -90, 70, 0],
            y: [0, -50, 80, 0],
            scale: [1, 1.25, 0.9, 1],
          } : undefined}
          transition={{
            duration: 32 * speed,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`absolute top-1/4 right-1/4 w-80 h-80 rounded-full filter ${getBlurClass()} ${colors.blob4}`}
        />
      )}
    </div>
  );
};

export default AuroraBackground;

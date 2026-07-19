import React from 'react';
import { motion } from 'motion/react';

interface AuroraBackgroundProps {
  theme: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ theme }) => {
  // Define colors based on theme
  const getColors = () => {
    switch (theme) {
      case 'light':
        return {
          blob1: 'bg-teal-200/30',
          blob2: 'bg-violet-200/30',
          blob3: 'bg-indigo-200/20',
          blob4: 'bg-rose-100/30',
        };
      case 'midnight':
        return {
          blob1: 'bg-cyan-500/10',
          blob2: 'bg-blue-600/10',
          blob3: 'bg-indigo-500/10',
          blob4: 'bg-violet-600/10',
        };
      case 'forest':
        return {
          blob1: 'bg-emerald-500/10',
          blob2: 'bg-teal-500/10',
          blob3: 'bg-green-600/10',
          blob4: 'bg-cyan-600/5',
        };
      case 'sunset':
        return {
          blob1: 'bg-rose-500/10',
          blob2: 'bg-orange-500/10',
          blob3: 'bg-amber-500/10',
          blob4: 'bg-purple-600/10',
        };
      case 'amethyst':
        return {
          blob1: 'bg-purple-500/15',
          blob2: 'bg-fuchsia-500/10',
          blob3: 'bg-indigo-600/15',
          blob4: 'bg-violet-500/10',
        };
      case 'dark':
      default:
        return {
          blob1: 'bg-emerald-500/10',
          blob2: 'bg-violet-600/10',
          blob3: 'bg-indigo-500/10',
          blob4: 'bg-teal-600/5',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blob 1 */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -90, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] ${colors.blob1}`}
      />

      {/* Blob 2 */}
      <motion.div
        animate={{
          x: [0, -70, 90, 0],
          y: [0, 80, -70, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px] ${colors.blob2}`}
      />

      {/* Blob 3 */}
      <motion.div
        animate={{
          x: [0, 100, -80, 0],
          y: [0, 60, -90, 0],
          scale: [1, 1.1, 0.85, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] ${colors.blob3}`}
      />

      {/* Blob 4 */}
      <motion.div
        animate={{
          x: [0, -90, 70, 0],
          y: [0, -50, 80, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute top-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px] ${colors.blob4}`}
      />
    </div>
  );
};

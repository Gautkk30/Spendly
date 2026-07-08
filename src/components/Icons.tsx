import React from 'react';
import * as Lucide from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<IconProps> = ({ name, className = '', size = 20 }) => {
  // Safe lookup with fallback
  const IconComponent = (Lucide as any)[name];
  
  if (!IconComponent) {
    return <Lucide.HelpCircle className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
};

export default DynamicIcon;


'use client';

import React from 'react';
import {
  Coffee, Sprout, Apple, Pill, Brain, Zap, Activity as ActivityIcon, CheckCircle as CheckCircleIcon,
  LucideProps, Icon as LucideIconComponent, HelpCircle // HelpCircle as a fallback
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  iconName: string;
}

// Define a mapping from string names to Lucide icon components
const iconMap: { [key: string]: LucideIconComponent } = {
  Coffee,
  Sprout,
  Apple,
  Pill,
  Brain,
  Zap,
  Activity: ActivityIcon,
  CheckCircle: CheckCircleIcon,
  // Add other icons that might be used in TreatmentPlanActivity by their string name
  // e.g., 'Moon': Moon, 'Bed': BedIcon,
};

const DynamicIcon: React.FC<DynamicIconProps> = ({ iconName, ...props }) => {
  const IconComponent = iconMap[iconName];

  if (!IconComponent) {
    // Fallback icon if the name is not found in the map
    console.warn(`DynamicIcon: Icon "${iconName}" not found. Rendering fallback.`);
    return <HelpCircle {...props} />; 
  }

  return <IconComponent {...props} />;
};

export default DynamicIcon;

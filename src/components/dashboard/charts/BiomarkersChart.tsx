// src/components/dashboard/charts/BiomarkersChart.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Target, MinusCircle, Droplets, HeartPulse, Wind, Brain, Bone, Shield, Activity, Sun, Moon, TrendingUp, TrendingDown, Users } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface BiomarkerDisplayData {
  id: string;
  name: string; 
  unit: string; 
  currentValue: number;
  targetValue: number;
  optimalRange: [number, number] | [number, number, string]; // string for notes like "lower is better"
  acceptableRangeOuter?: [number, number]; 
  status: 'optimal' | 'warning' | 'critical' | 'info';
  statusText: string;
  icon: React.ElementType;
}

const biomarkerConfig: Omit<BiomarkerDisplayData, 'id' | 'currentValue' | 'status' | 'statusText'>[] = [
  // Vital Signs & Basic Metrics
  { name: 'Resting Heart Rate', unit: 'bpm', optimalRange: [60, 80], target: 70, icon: HeartPulse },
  { name: 'Systolic BP', unit: 'mmHg', optimalRange: [110, 120], target: 115, icon: HeartPulse },
  { name: 'Diastolic BP', unit: 'mmHg', optimalRange: [70, 80], target: 75, icon: HeartPulse },
  { name: 'Body Temperature', unit: '°C', optimalRange: [36.5, 37.2], target: 36.8, icon: Sun }, // Placeholder icon
  { name: 'BMI', unit: '', optimalRange: [18.5, 24.9], target: 22, icon: Users },
  { name: 'Waist Circumference', unit: 'cm', optimalRange: [0, 88, 'female'] , target: 80, icon: TrendingUp }, // Target for female, will need logic
  // Blood Sugar
  { name: 'Fasting Glucose', unit: 'mg/dL', optimalRange: [70, 99], target: 90, icon: Droplets },
  { name: 'HbA1c', unit: '%', optimalRange: [4.0, 5.6], target: 5.0, icon: Droplets },
  // Cholesterol & Lipids
  { name: 'Total Cholesterol', unit: 'mg/dL', optimalRange: [0, 200, 'lower is better'], target: 180, icon: Droplets },
  { name: 'LDL Cholesterol', unit: 'mg/dL', optimalRange: [0, 100, 'lower is better'], target: 80, icon: Droplets },
  { name: 'HDL Cholesterol', unit: 'mg/dL', optimalRange: [60, 200, 'higher is better'], target: 70, icon: Droplets }, // Optimal for HDL is higher
  { name: 'Triglycerides', unit: 'mg/dL', optimalRange: [0, 150, 'lower is better'], target: 100, icon: Droplets },
  // Inflammation
  { name: 'CRP (hs-CRP)', unit: 'mg/L', optimalRange: [0, 1.0, 'lower is better'], target: 0.5, icon: Shield },
  // Liver Function
  { name: 'ALT', unit: 'U/L', optimalRange: [7, 55], target: 30, icon: Activity },
  { name: 'AST', unit: 'U/L', optimalRange: [8, 48], target: 25, icon: Activity },
  // Kidney Function
  { name: 'Creatinine', unit: 'mg/dL', optimalRange: [0.6, 1.2], target: 0.9, icon: Activity },
  { name: 'eGFR', unit: 'mL/min/1.73m²', optimalRange: [90, 200, 'higher is better'], target: 100, icon: Activity },
  // Thyroid
  { name: 'TSH', unit: 'mIU/L', optimalRange: [0.4, 4.0], target: 2.0, icon: Brain }, // Placeholder, thyroid often needs more specific icons
  // Vitamins & Minerals
  { name: 'Vitamin D', unit: 'ng/mL', optimalRange: [30, 50], target: 40, icon: Sun },
  { name: 'Vitamin B12', unit: 'pg/mL', optimalRange: [200, 900], target: 500, icon: Brain },
  { name: 'Iron (Ferritin)', unit: 'ng/mL', optimalRange: [30, 300], target: 100, icon: Bone }, // Placeholder
  { name: 'Magnesium', unit: 'mg/dL', optimalRange: [1.7, 2.2], target: 2.0, icon: Bone }, // Placeholder
  // Sleep & Stress
  { name: 'Sleep Duration', unit: 'hours', optimalRange: [7, 9], target: 8, icon: Moon },
  { name: 'Sleep Quality Score', unit: '%', optimalRange: [85, 100], target: 90, icon: Moon },
  { name: 'Stress Score (Subjective 1-10)', unit: '', optimalRange: [1, 3, 'lower is better'], target: 2, icon: Brain },
  // Fitness
  { name: 'VO2 Max', unit: 'mL/kg/min', optimalRange: [35, 50, 'higher is better'], target: 42, icon: Wind },
  { name: 'Steps per Day', unit: 'steps', optimalRange: [8000, 12000], target: 10000, icon: Activity },
  { name: 'Active Minutes per Week', unit: 'min', optimalRange: [150, 300], target: 200, icon: Activity },
  // Other
  { name: 'Hydration (Glasses of Water)', unit: 'glasses', optimalRange: [8, 12], target: 10, icon: Droplets },
  { name: 'Mindfulness Minutes per Day', unit: 'min', optimalRange: [10, 30], target: 20, icon: Brain },
  { name: 'Grip Strength', unit: 'kg', optimalRange: [30, 50, 'depends on age/gender'], target: 40, icon: TrendingUp },
  { name: 'Flexibility (Sit and Reach)', unit: 'cm', optimalRange: [0, 10, 'higher is better, depends on baseline'], target: 5, icon: TrendingUp },
  { name: 'Omega-3 Index', unit: '%', optimalRange: [8, 12], target: 10, icon: Droplets },
  { name: 'Homocysteine', unit: 'µmol/L', optimalRange: [5, 15, 'lower is better'], target: 10, icon: Shield },
  { name: 'Blood Urea Nitrogen (BUN)', unit: 'mg/dL', optimalRange: [7, 20], target: 14, icon: Activity },
  { name: 'Potassium', unit: 'mEq/L', optimalRange: [3.5, 5.0], target: 4.2, icon: Droplets },
  { name: 'Sodium', unit: 'mEq/L', optimalRange: [135, 145], target: 140, icon: Droplets },
  { name: 'White Blood Cell Count', unit: 'x10^9/L', optimalRange: [4.0, 11.0], target: 7.0, icon: Shield },
  { name: 'Red Blood Cell Count', unit: 'x10^12/L', optimalRange: [4.2, 5.4, 'female'], target: 4.8, icon: Droplets }, // Example gender specific
  { name: 'Platelet Count', unit: 'x10^9/L', optimalRange: [150, 450], target: 250, icon: Shield },
];


const generateBiomarkerDisplayData = (): BiomarkerDisplayData[] => {
  return biomarkerConfig.slice(0, 40).map((bm, index) => { // Ensure we take up to 40
    let currentValue;
    const rand = Math.random();
    
    const [optLow, optHigh] = bm.optimalRange;

    if (rand < 0.15) { // Critical
        currentValue = rand < 0.075 ? optLow * (0.6 + Math.random() * 0.2) : optHigh * (1.2 + Math.random() * 0.3);
    } else if (rand < 0.45) { // Warning
        currentValue = rand < 0.3 ? optLow * (0.8 + Math.random() * 0.19) : optHigh * (1.01 + Math.random() * 0.19);
    } else { // Optimal
      currentValue = optLow + Math.random() * (optHigh - optLow);
    }
    
    currentValue = parseFloat(currentValue.toFixed(bm.unit === 'mg/dL' || bm.unit === 'bpm' || bm.unit === 'mmHg' || bm.unit === '' ? 0 : (bm.unit === '%' || bm.unit === 'mIU/L' || bm.unit === 'ng/mL' ? 1: 2) ));
    currentValue = Math.max(0, currentValue);

    let status: BiomarkerDisplayData['status'] = 'optimal';
    let statusText = 'Optimal';
    
    // Adjust for "lower is better" or "higher is better" logic
    const lowerIsBetter = bm.optimalRange[2] === 'lower is better';
    const higherIsBetter = bm.optimalRange[2] === 'higher is better';

    if (currentValue >= optLow && currentValue <= optHigh) {
      status = 'optimal';
      statusText = 'Optimal';
    } else { // Not in optimal range
        const acceptableLow = bm.acceptableRangeOuter ? bm.acceptableRangeOuter[0] : optLow * 0.8;
        const acceptableHigh = bm.acceptableRangeOuter ? bm.acceptableRangeOuter[1] : optHigh * 1.2;

        if (currentValue >= acceptableLow && currentValue <= acceptableHigh) {
            status = 'warning';
            if (lowerIsBetter && currentValue < optLow) statusText = 'Slightly Low (Good)';
            else if (higherIsBetter && currentValue > optHigh) statusText = 'Slightly High (Good)';
            else statusText = currentValue < optLow ? 'Slightly Low' : 'Slightly High';
        } else {
            status = 'critical';
            statusText = currentValue < acceptableLow ? 'Critically Low' : 'Critically High';
        }
    }


    return {
      id: `bm-${index}`,
      name: bm.name,
      unit: bm.unit,
      currentValue,
      targetValue: bm.targetValue,
      optimalRange: bm.optimalRange,
      acceptableRangeOuter: bm.acceptableRangeOuter,
      status,
      statusText,
      icon: bm.icon,
    };
  });
};


const StatusIndicator = ({ status, statusText }: { status: BiomarkerDisplayData['status'], statusText: string }) => {
  let IconComponent;
  let colorClass;
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";

  switch (status) {
    case 'optimal':
      IconComponent = CheckCircle;
      colorClass = 'text-green-600'; // Using specific colors for status for clarity
      badgeVariant = 'default'; 
      break;
    case 'warning':
      IconComponent = AlertTriangle;
      colorClass = 'text-yellow-600';
      badgeVariant = 'secondary';
      break;
    case 'critical':
      IconComponent = XCircle;
      colorClass = 'text-red-600';
      badgeVariant = 'destructive';
      break;
    default:
      IconComponent = MinusCircle;
      colorClass = 'text-muted-foreground';
      badgeVariant = 'outline';
  }

  return (
    <Badge variant={badgeVariant} className={`flex items-center gap-1.5 text-xs sm:text-sm ${colorClass} ${badgeVariant === 'default' ? 'bg-green-500/10 border-green-500/30' : ''} ${badgeVariant === 'secondary' ? 'bg-yellow-500/10 border-yellow-500/30' : ''} ${badgeVariant === 'destructive' ? 'bg-red-500/10 border-red-500/30' : ''}`}>
      <IconComponent size={16} className="flex-shrink-0" />
      <span>{statusText}</span>
    </Badge>
  );
};


export default function BiomarkersChart() {
  const [data, setData] = useState<BiomarkerDisplayData[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setData(generateBiomarkerDisplayData());
  }, []);

  if (!isClient) {
    return (
      <div className="space-y-4">
        {Array(5).fill(0).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4" data-ai-hint="biomarker list">
      {data.map((bm) => (
        <Card key={bm.id} className="shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out bg-card border border-border/70">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-base font-medium text-primary flex items-center gap-2">
              <bm.icon size={18} className="text-primary/80" />
              {bm.name}
            </CardTitle>
            {bm.unit && <CardDescription className="text-xs text-muted-foreground mt-0.5 self-start pt-1">{bm.unit}</CardDescription>}
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-2 space-y-2 text-sm">
            <div className="flex justify-between items-baseline py-1 border-b border-border/30">
              <span className="text-muted-foreground text-xs">Current:</span>
              <span className={`font-semibold text-md ${bm.status === 'critical' ? 'text-destructive' : bm.status === 'warning' ? 'text-yellow-600' : 'text-foreground'}`}>{bm.currentValue}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-muted-foreground text-xs">Target:</span>
              <Badge variant="outline" className="text-xs font-normal">{bm.targetValue}</Badge>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-muted-foreground text-xs">Optimal Range:</span>
              <Badge variant="outline" className="text-xs font-normal">{bm.optimalRange.slice(0,2).join(' - ')}</Badge>
            </div>
            <div className="pt-2 mt-1 flex justify-end">
                <StatusIndicator status={bm.status} statusText={bm.statusText} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

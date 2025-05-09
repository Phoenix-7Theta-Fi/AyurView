'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Target, MinusCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface BiomarkerDisplayData {
  id: string;
  name: string; 
  unit: string; 
  currentValue: number;
  targetValue: number;
  optimalRange: [number, number]; 
  acceptableRangeOuter?: [number, number]; 
  status: 'optimal' | 'warning' | 'critical';
  statusText: string;
}

const biomarkerConfig = [
  { name: 'Glucose', unit: 'mg/dL', optimalRange: [90, 100] as [number, number], target: 95, acceptableRangeOuter: [70, 125] as [number, number] },
  { name: 'Total Cholesterol', unit: 'mg/dL', optimalRange: [160, 200] as [number, number], target: 180, acceptableRangeOuter: [120, 240] as [number, number], lowerIsGenerallyBetter: true },
  { name: 'Systolic BP', unit: 'mmHg', optimalRange: [110, 120] as [number, number], target: 115, acceptableRangeOuter: [90, 140] as [number, number] },
  { name: 'Diastolic BP', unit: 'mmHg', optimalRange: [70, 80] as [number, number], target: 75, acceptableRangeOuter: [60, 90] as [number, number] },
  { name: 'Vitamin D', unit: 'ng/mL', optimalRange: [30, 50] as [number, number], target: 40, acceptableRangeOuter: [20, 80] as [number, number] },
  { name: 'Resting Heart Rate', unit: 'bpm', optimalRange: [60, 80] as [number, number], target: 70, acceptableRangeOuter: [50, 100] as [number, number] },
  { name: 'BMI', unit: '', optimalRange: [18.5, 24.9] as [number, number], target: 22, acceptableRangeOuter: [17, 29.9] as [number, number] },
  { name: 'Sleep Quality Score', unit: '%', optimalRange: [85, 100] as [number, number], target: 90, acceptableRangeOuter: [70, 100] as [number, number], higherIsGenerallyBetter: true },
];

const generateBiomarkerDisplayData = (): BiomarkerDisplayData[] => {
  return biomarkerConfig.map((bm, index) => {
    let currentValue;
    const rand = Math.random();
    // Generate current value relative to optimal and acceptable ranges
    if (rand < 0.1) { // ~10% critical low
        currentValue = (bm.acceptableRangeOuter ? bm.acceptableRangeOuter[0] : bm.optimalRange[0]) * (0.7 + Math.random() * 0.2);
    } else if (rand < 0.2) { // ~10% critical high
        currentValue = (bm.acceptableRangeOuter ? bm.acceptableRangeOuter[1] : bm.optimalRange[1]) * (1.1 + Math.random() * 0.3);
    } else if (rand < 0.4) { // ~20% warning low
        currentValue = bm.optimalRange[0] * (0.85 + Math.random() * 0.14);
    } else if (rand < 0.6) { // ~20% warning high
        currentValue = bm.optimalRange[1] * (1.01 + Math.random() * 0.14);
    } else { // ~40% optimal
      currentValue = bm.optimalRange[0] + Math.random() * (bm.optimalRange[1] - bm.optimalRange[0]);
    }
    
    currentValue = parseFloat(currentValue.toFixed(bm.unit === 'mg/dL' || bm.unit === 'bpm' || bm.unit === 'mmHg' ? 0 : 1));
    currentValue = Math.max(0, currentValue); // Ensure non-negative

    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    let statusText = 'Optimal';

    const [optLow, optHigh] = bm.optimalRange;
    const [accOuterLow, accOuterHigh] = bm.acceptableRangeOuter || [optLow * 0.8, optHigh * 1.2]; // Fallback for acceptable range

    if (currentValue >= optLow && currentValue <= optHigh) {
      status = 'optimal';
      statusText = 'Optimal';
    } else if (currentValue >= accOuterLow && currentValue <= accOuterHigh) {
      status = 'warning';
      if (bm.lowerIsGenerallyBetter && currentValue < optLow) {
        statusText = 'Good (Low)';
      } else if (bm.higherIsGenerallyBetter && currentValue > optHigh) {
        statusText = 'Good (High)';
      } else {
        statusText = (currentValue < optLow) ? 'Slightly Low' : 'Slightly High';
      }
    } else {
      status = 'critical';
      statusText = (currentValue < accOuterLow) ? 'Critically Low' : 'Critically High';
    }

    return {
      id: `bm-${index}`,
      name: bm.name,
      unit: bm.unit,
      currentValue,
      targetValue: bm.target,
      optimalRange: bm.optimalRange,
      acceptableRangeOuter: bm.acceptableRangeOuter,
      status,
      statusText,
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
      colorClass = 'text-green-600';
      badgeVariant = 'default'; // Or a specific "success" variant if defined in theme
      break;
    case 'warning':
      IconComponent = AlertTriangle;
      colorClass = 'text-yellow-600';
      badgeVariant = 'secondary'; // Or a specific "warning" variant
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
    <Badge variant={badgeVariant} className={`flex items-center gap-1.5 text-xs sm:text-sm ${colorClass} bg-opacity-10 border-opacity-30`}>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6).fill(0).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-muted rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-muted rounded w-1/4"></div>
            </CardHeader>
            <CardContent className="space-y-2 pt-2">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-6 bg-muted rounded w-1/4"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-5 bg-muted rounded w-1/5"></div>
              </div>
               <div className="flex justify-between items-center">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-5 bg-muted rounded w-1/4"></div>
              </div>
              <div className="pt-2 border-t border-muted/50">
                 <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" data-ai-hint="health indicators list">
      {data.map((bm) => (
        <Card key={bm.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 ease-in-out bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-md sm:text-lg font-semibold text-primary flex items-center gap-2">
              <Target size={18} className="text-primary/80" />
              {bm.name}
            </CardTitle>
            {bm.unit && <CardDescription className="text-xs text-muted-foreground mt-0.5">Unit: {bm.unit}</CardDescription>}
          </CardHeader>
          <CardContent className="space-y-2.5 text-xs sm:text-sm">
            <div className="flex justify-between items-baseline py-1.5 border-b border-border/50">
              <span className="text-muted-foreground">Current:</span>
              <span className="font-bold text-lg sm:text-xl text-foreground">{bm.currentValue}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Target:</span>
              <Badge variant="secondary" className="text-xs sm:text-sm font-medium">{bm.targetValue}</Badge>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-muted-foreground">Optimal Range:</span>
              <Badge variant="outline" className="text-xs sm:text-sm">{bm.optimalRange.join(' - ')}</Badge>
            </div>
             {bm.acceptableRangeOuter && (
                <div className="flex justify-between items-center text-xs text-muted-foreground/80 py-0.5">
                    <span>Acceptable:</span>
                    <span>{bm.acceptableRangeOuter.join(' - ')}</span>
                </div>
            )}
            <div className="pt-2.5 mt-1 border-t border-border/70 flex justify-center">
                <StatusIndicator status={bm.status} statusText={bm.statusText} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
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
  optimalRange: [number, number];
  status: 'optimal' | 'warning' | 'critical' | 'info';
  statusText: string;
  icon: React.ElementType;
}

// Icon mapping for different biomarker types
const biomarkerIcons: Record<string, React.ElementType> = {
  'Resting Heart Rate': HeartPulse,
  'Systolic BP': HeartPulse,
  'Diastolic BP': HeartPulse,
  'Body Temperature': Sun,
  'BMI': Users,
  'Waist Circumference': TrendingUp,
  'Fasting Glucose': Droplets,
  'HbA1c': Droplets,
  'Total Cholesterol': Droplets,
  'LDL Cholesterol': Droplets,
  'HDL Cholesterol': Droplets,
  'Triglycerides': Droplets,
  'CRP (hs-CRP)': Shield,
  'ALT': Activity,
  'AST': Activity,
  'Creatinine': Activity,
  'eGFR': Activity,
  'TSH': Brain,
  'Vitamin D': Sun,
  'Vitamin B12': Brain,
  'Iron (Ferritin)': Bone,
  'Magnesium': Bone,
  'VO2 Max': Wind,
  'Steps per Day': Activity,
  'Active Minutes per Week': Activity
};

const StatusIndicator = ({ status, statusText }: { status: BiomarkerDisplayData['status'], statusText: string }) => {
  let IconComponent;
  let colorClass;
  let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "default";

  switch (status) {
    case 'optimal':
      IconComponent = CheckCircle;
      colorClass = 'text-green-600';
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBiomarkers() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view biomarker data');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/biomarkers', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch biomarker data');
        }

        const result = await response.json();
        
        // Transform API data to match component's display format
        const displayData: BiomarkerDisplayData[] = result.data.map((bm: any) => {
          let status: BiomarkerDisplayData['status'] = 'optimal';
          let statusText = 'Optimal';

          const { min, max } = bm.referenceRange;
          if (bm.value >= min && bm.value <= max) {
            status = 'optimal';
            statusText = 'Optimal';
          } else {
            const acceptableLow = min * 0.8;
            const acceptableHigh = max * 1.2;
            
            if (bm.value >= acceptableLow && bm.value <= acceptableHigh) {
              status = 'warning';
              statusText = bm.value < min ? 'Slightly Low' : 'Slightly High';
            } else {
              status = 'critical';
              statusText = bm.value < acceptableLow ? 'Critically Low' : 'Critically High';
            }
          }
          
          return {
            id: bm.id,
            name: bm.biomarkerName,
            unit: bm.unit,
            currentValue: bm.value,
            targetValue: bm.targetValue,
            optimalRange: [bm.referenceRange.min, bm.referenceRange.max],
            status,
            statusText,
            icon: biomarkerIcons[bm.biomarkerName] || Target
          };
        });

        setData(displayData);
        setError(null);
      } catch (err) {
        console.error('Error fetching biomarker data:', err);
        setError('Failed to load biomarker data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBiomarkers();
  }, []);

  if (error) {
    return (
      <Card className="p-6">
        <CardHeader className="pb-2">
          <CardTitle>Biomarkers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
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
              <Badge variant="outline" className="text-xs font-normal">{bm.optimalRange.join(' - ')}</Badge>
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

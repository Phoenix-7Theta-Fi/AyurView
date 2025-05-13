import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Activity } from 'lucide-react';

interface HealthAssessmentToggleProps {
  isActive: boolean;
  onToggle: (value: boolean) => void;
}

export default function HealthAssessmentToggle({ isActive, onToggle }: HealthAssessmentToggleProps) {
  return (
    <div className="flex items-center space-x-2 p-2 border-b">
      <Activity size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
      <Label htmlFor="health-mode" className={isActive ? "text-primary font-medium" : "text-muted-foreground"}>
        Health Assessment Mode
      </Label>
      <Switch
        id="health-mode"
        checked={isActive}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}

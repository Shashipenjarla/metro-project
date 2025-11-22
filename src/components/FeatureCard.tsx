import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  lineColor: 'red' | 'blue' | 'green';
  user?: any;
  isComingSoon?: boolean;
}

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  path, 
  lineColor, 
  user,
  isComingSoon = false 
}: FeatureCardProps) => {
  const navigate = useNavigate();

  const colorClasses = {
    red: {
      border: 'border-metro-red',
      bg: 'bg-metro-red/10',
      text: 'text-metro-red',
      gradient: 'bg-gradient-metro-red',
      glow: 'hover:shadow-glow-red'
    },
    blue: {
      border: 'border-metro-blue',
      bg: 'bg-metro-blue/10',
      text: 'text-metro-blue',
      gradient: 'bg-gradient-metro-blue',
      glow: 'hover:shadow-glow-blue'
    },
    green: {
      border: 'border-metro-green',
      bg: 'bg-metro-green/10',
      text: 'text-metro-green',
      gradient: 'bg-gradient-metro-green',
      glow: 'hover:shadow-glow-green'
    }
  };

  const colors = colorClasses[lineColor];

  const handleClick = () => {
    if (isComingSoon) return;
    
    if (path.startsWith('#')) {
      // Handle anchor link for voice assistant
      const element = document.getElementById(path.slice(1));
      element?.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Navigate to page
      navigate(path);
    }
  };

  return (
    <Card 
      className={`metro-card cursor-pointer group ${colors.glow} ${isComingSoon ? 'opacity-75 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      style={{ '--line-color': lineColor === 'red' ? '#D32F2F' : lineColor === 'blue' ? '#1565C0' : '#2E7D32' } as any}
    >
      <CardHeader className="space-y-4">
        {/* Icon with colored background */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} transition-metro group-hover:scale-110`}>
          <Icon className={`h-6 w-6 ${colors.text}`} />
        </div>

        {/* Line color pill */}
        <div className="flex items-center justify-between">
          <div className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${colors.bg} ${colors.text}`}>
            {lineColor.charAt(0).toUpperCase() + lineColor.slice(1)} Line
          </div>
          {isComingSoon && (
            <span className="rounded-full bg-accent-yellow/20 px-2 py-1 text-xs font-medium text-yellow-700 dark:text-yellow-300">
              Coming Soon
            </span>
          )}
        </div>

        <div>
          <CardTitle className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-opacity-80 transition-metro">
            {title}
          </CardTitle>
          <CardDescription className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Button 
          className={`w-full ${colors.gradient} hover:shadow-lg focus-ring transition-metro font-semibold ${isComingSoon ? 'opacity-50 cursor-not-allowed' : 'shimmer'}`}
          disabled={isComingSoon}
        >
          {isComingSoon 
            ? "Coming Soon" 
            : "Access Feature"
          }
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
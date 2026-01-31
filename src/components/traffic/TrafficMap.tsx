import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Navigation, 
  AlertTriangle, 
  Clock, 
  Route, 
  Train,
  Bike,
  MapPin,
  Zap,
  TrendingUp
} from "lucide-react";

interface TrafficMapProps {
  onTimeSaved?: (minutes: number, route: string) => void;
}

interface TrafficRoute {
  id: string;
  name: string;
  duration: number;
  trafficLevel: 'low' | 'medium' | 'heavy';
  color: string;
  isAlternate?: boolean;
  isMetroAssisted?: boolean;
  metroStation?: string;
}

const mockRoutes: TrafficRoute[] = [
  { id: '1', name: 'Current Route (Road)', duration: 45, trafficLevel: 'heavy', color: '#ef4444' },
  { id: '2', name: 'Alternate via Outer Ring', duration: 38, trafficLevel: 'medium', color: '#f97316', isAlternate: true },
  { id: '3', name: 'Metro + Bike', duration: 28, trafficLevel: 'low', color: '#22c55e', isMetroAssisted: true, metroStation: 'Ameerpet' },
];

export function TrafficMap({ onTimeSaved }: TrafficMapProps) {
  const [selectedRoute, setSelectedRoute] = useState<TrafficRoute | null>(null);
  const [bikePosition, setBikePosition] = useState(0);
  const [showCongestionAlert, setShowCongestionAlert] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Animate bike along route
  useEffect(() => {
    if (selectedRoute) {
      const animate = () => {
        setBikePosition(prev => {
          if (prev >= 100) return 0;
          return prev + 0.5;
        });
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [selectedRoute]);

  const handleRouteSelect = (route: TrafficRoute) => {
    setSelectedRoute(route);
    setBikePosition(0);
    
    if (route.isMetroAssisted && onTimeSaved) {
      const timeSaved = mockRoutes[0].duration - route.duration;
      onTimeSaved(timeSaved, `${route.metroStation} Metro`);
    }
  };

  const getTrafficBadge = (level: string) => {
    const styles = {
      low: 'bg-green-500/20 text-green-600 border-green-500/30',
      medium: 'bg-orange-500/20 text-orange-600 border-orange-500/30',
      heavy: 'bg-red-500/20 text-red-600 border-red-500/30',
    };
    return styles[level as keyof typeof styles] || styles.low;
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden">
      {/* Google Maps Embed with Traffic Layer */}
      <div ref={mapRef} className="absolute inset-0">
        <iframe
          src="https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=Miyapur+Metro+Station,+Hyderabad&destination=Raidurg+Metro+Station,+Hyderabad&mode=driving&avoid=tolls"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="grayscale-[20%]"
        />
      </div>

      {/* Traffic Overlay Indicators */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border shadow-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
            Light Traffic
          </Badge>
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border shadow-lg">
            <div className="w-2 h-2 rounded-full bg-orange-500 mr-2 animate-pulse" />
            Moderate
          </Badge>
          <Badge className="bg-background/90 backdrop-blur-sm text-foreground border shadow-lg">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            Heavy
          </Badge>
        </div>
      </div>

      {/* Congestion Alert */}
      {showCongestionAlert && (
        <div className="absolute top-16 left-4 right-4 z-10 animate-fade-in">
          <Card className="bg-red-500/95 backdrop-blur-sm text-white p-3 shadow-xl border-0">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 animate-pulse" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Heavy Congestion Detected</p>
                <p className="text-xs text-red-100 mt-0.5">
                  Gachibowli Junction - 25 min delay expected
                </p>
              </div>
              <button 
                onClick={() => setShowCongestionAlert(false)}
                className="text-red-200 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Metro Station Marker */}
      <div className="absolute top-1/3 right-1/4 z-10">
        <div className="relative">
          <div className="absolute -inset-4 bg-metro-blue/20 rounded-full animate-ping" />
          <div className="relative bg-metro-blue text-white p-2 rounded-full shadow-lg">
            <Train className="h-4 w-4" />
          </div>
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <Badge className="bg-metro-blue text-white text-xs shadow-lg">
              Ameerpet Metro
            </Badge>
          </div>
        </div>
      </div>

      {/* Animated Bike Marker */}
      {selectedRoute && (
        <div 
          className="absolute z-20 transition-all duration-100"
          style={{
            left: `${10 + (bikePosition * 0.8)}%`,
            top: `${30 + Math.sin(bikePosition * 0.1) * 10}%`,
          }}
        >
          <div className="relative">
            <div className="absolute -inset-2 bg-primary/30 rounded-full animate-pulse" />
            <div className="relative bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
              <Bike className="h-4 w-4" />
            </div>
          </div>
        </div>
      )}

      {/* Route Selection Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <Card className="bg-background/95 backdrop-blur-md shadow-2xl border-0 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Route className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Route Options</span>
            {selectedRoute?.isMetroAssisted && (
              <Badge className="bg-green-500/20 text-green-600 text-xs ml-auto">
                <Zap className="h-3 w-3 mr-1" />
                Smart Choice
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            {mockRoutes.map((route) => (
              <button
                key={route.id}
                onClick={() => handleRouteSelect(route)}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedRoute?.id === route.id
                    ? 'border-primary bg-primary/10 shadow-md'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: route.color }}
                    />
                    <div>
                      <p className="font-medium text-sm">{route.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className={`text-xs ${getTrafficBadge(route.trafficLevel)}`}>
                          {route.trafficLevel}
                        </Badge>
                        {route.isMetroAssisted && (
                          <Badge className="bg-metro-blue/20 text-metro-blue text-xs">
                            <Train className="h-3 w-3 mr-1" />
                            Metro
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-foreground font-semibold">
                      <Clock className="h-3 w-3" />
                      {route.duration} min
                    </div>
                    {route.isMetroAssisted && (
                      <p className="text-xs text-green-600 font-medium mt-0.5">
                        Save {mockRoutes[0].duration - route.duration} min
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Time Saving Insight Card */}
          {selectedRoute?.isMetroAssisted && (
            <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-500/20">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-green-700 dark:text-green-400">
                    Smart Time Saver
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Predictable arrival • No traffic stress • {mockRoutes[0].duration - selectedRoute.duration} min faster
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedRoute && (
            <Button 
              className="w-full mt-3 bg-primary hover:bg-primary/90"
              onClick={() => {
                if (selectedRoute.isMetroAssisted && onTimeSaved) {
                  const timeSaved = mockRoutes[0].duration - selectedRoute.duration;
                  onTimeSaved(timeSaved, `${selectedRoute.metroStation} Metro Route`);
                }
              }}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Navigation
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}

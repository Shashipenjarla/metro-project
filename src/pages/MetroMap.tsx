import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Activity, Navigation } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { TrafficMap } from "@/components/traffic/TrafficMap";
import { TimeSavedNotification } from "@/components/traffic/TimeSavedNotification";
import { useTimeWallet } from "@/hooks/useTimeWallet";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import metroMapImage from "@/assets/metro-map.jpg";

const MetroMap = () => {
  const [activeTab, setActiveTab] = useState("traffic");
  const [notification, setNotification] = useState<{ timeSaved: number; credits: number } | null>(null);
  const { addTimeCredits } = useTimeWallet();

  const handleTimeSaved = useCallback((minutes: number, route: string) => {
    const credits = addTimeCredits(minutes, route);
    setNotification({ timeSaved: minutes, credits });
  }, [addTimeCredits]);

  return (
    <PageLayout 
      title="Traffic Intelligence" 
      subtitle="Smart route planning with real-time traffic insights"
    >
      {notification && (
        <TimeSavedNotification
          timeSaved={notification.timeSaved}
          credits={notification.credits}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="traffic" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Live Traffic Map
            </TabsTrigger>
            <TabsTrigger value="metro" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Metro Network
            </TabsTrigger>
          </TabsList>

          <TabsContent value="traffic" className="mt-0">
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 via-metro-green/10 to-metro-blue/10 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Navigation className="h-5 w-5 text-primary" />
                      Live Traffic Intelligence
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Real-time traffic analysis with smart route suggestions
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-500/20 text-green-600 text-sm font-medium">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      Live
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <TrafficMap onTimeSaved={handleTimeSaved} />
                </div>
              </CardContent>
            </Card>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-500/20">
                      <Activity className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Congestion Detection</p>
                      <p className="text-xs text-muted-foreground">
                        Real-time traffic alerts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <Navigation className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Smart Alternatives</p>
                      <p className="text-xs text-muted-foreground">
                        Metro-assisted routes
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-500/20">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Nearest Metro</p>
                      <p className="text-xs text-muted-foreground">
                        Quick station access
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="metro" className="mt-0">
            <Card className="glass-effect border-white/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-metro-blue/10 via-metro-green/10 to-metro-red/10">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <MapPin className="h-6 w-6 text-metro-blue" />
                  Hyderabad Metro Rail Route Map
                </CardTitle>
                <CardDescription className="text-base">
                  Complete network map showing all metro lines and stations
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 md:p-6">
                <div className="relative w-full overflow-hidden rounded-lg border border-white/20">
                  <img 
                    src={metroMapImage} 
                    alt="Hyderabad Metro Rail Route Map" 
                    className="w-full h-auto"
                  />
                </div>
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-metro-blue/10 border border-metro-blue/20">
                    <div className="h-4 w-4 rounded-full bg-metro-blue"></div>
                    <div>
                      <p className="font-semibold text-metro-blue">Blue Line</p>
                      <p className="text-sm text-muted-foreground">Nagole - Raidurg</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-metro-red/10 border border-metro-red/20">
                    <div className="h-4 w-4 rounded-full bg-metro-red"></div>
                    <div>
                      <p className="font-semibold text-metro-red">Red Line</p>
                      <p className="text-sm text-muted-foreground">Miyapur - LB Nagar</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-metro-green/10 border border-metro-green/20">
                    <div className="h-4 w-4 rounded-full bg-metro-green"></div>
                    <div>
                      <p className="font-semibold text-metro-green">Green Line</p>
                      <p className="text-sm text-muted-foreground">JBS Parade Ground - MG Bus Stand</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default MetroMap;

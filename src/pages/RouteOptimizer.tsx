import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, IndianRupee, Route, Zap, TrendingUp, Ruler } from "lucide-react";
import StationSelector from "@/components/StationSelector";
import { METRO_STATIONS } from "@/components/StationSelector";
import PageLayout from "@/components/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getShortestPathService, 
  getStationLine,
  PathMetric
} from "@/services/metro";

interface PathResult {
  path: string[];
  noOfStations: number;
  totalDistance: number;
  totalTime: number;
  fare: number;
  transfers: number;
  optimizedBy: PathMetric;
}

const RouteOptimizer = () => {
  const [sourceStation, setSourceStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizeBy, setOptimizeBy] = useState<PathMetric>("time");
  const navigate = useNavigate();

  const pathService = getShortestPathService();

  /**
   * Find optimal route using the ShortestPathService
   */
  const findOptimalRoute = () => {
    if (!sourceStation || !destinationStation) {
      toast({
        title: "Please select stations",
        description: "Choose both source and destination stations",
        variant: "destructive",
      });
      return;
    }

    if (sourceStation === destinationStation) {
      toast({
        title: "Same station selected",
        description: "Source and destination cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Convert station IDs to station names
    const sourceStationName = METRO_STATIONS.find((s: any) => s.id === sourceStation)?.name || sourceStation;
    const destinationStationName = METRO_STATIONS.find((s: any) => s.id === destinationStation)?.name || destinationStation;

    // Simulate processing delay for UX
    setTimeout(() => {
      // Use the modular ShortestPathService
      const response = optimizeBy === 'distance' 
        ? pathService.getShortestPathByDistance(sourceStationName, destinationStationName)
        : pathService.getShortestPathByTime(sourceStationName, destinationStationName);

      if (!response.success || !response.data) {
        toast({
          title: "No route found",
          description: response.error || "Unable to find a route between selected stations",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const result = response.data;

      setPathResult({
        path: result.path,
        noOfStations: result.noOfStations,
        totalDistance: result.totalDistance,
        totalTime: result.totalTime,
        fare: result.fare,
        transfers: result.transfers,
        optimizedBy: result.optimizedBy
      });

      setLoading(false);

      toast({
        title: "Route Found!",
        description: `Optimal path calculated with ${result.noOfStations} stops`,
      });
    }, 800);
  };

  const getLineColor = (line: string | undefined) => {
    switch (line) {
      case "Red": return "bg-red-500 text-white";
      case "Blue": return "bg-blue-500 text-white";
      case "Green": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const clearRoute = () => {
    setSourceStation("");
    setDestinationStation("");
    setPathResult(null);
  };

  const formatDistance = (meters: number): string => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <PageLayout title="Route Optimizer" subtitle="Find the shortest path between metro stations using advanced algorithms">
      <div className="max-w-5xl mx-auto space-y-8">
        <Card className="glass-effect border-white/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-metro-red/10 via-metro-blue/10 to-metro-green/10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Route className="h-6 w-6 text-metro-blue" />
              Smart Route Planner
            </CardTitle>
            <CardDescription className="text-base">
              Find the optimal path using Dijkstra's Algorithm with real-time fare calculation and transfer optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Optimization Mode Tabs */}
            <Tabs value={optimizeBy} onValueChange={(v) => setOptimizeBy(v as PathMetric)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Fastest Route
                </TabsTrigger>
                <TabsTrigger value="distance" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Shortest Distance
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StationSelector
                value={sourceStation}
                onValueChange={setSourceStation}
                label="From Station"
                placeholder="Search source station..."
              />
              
              <StationSelector
                value={destinationStation}
                onValueChange={setDestinationStation}
                label="To Station"
                placeholder="Search destination station..."
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={findOptimalRoute} 
                disabled={loading || !sourceStation || !destinationStation}
                className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-metro-red to-metro-blue hover:from-metro-red/90 hover:to-metro-blue/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Finding Route...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Find Optimal Route
                  </div>
                )}
              </Button>
              <Button variant="outline" onClick={clearRoute} className="h-12 px-6">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Route Result */}
        {pathResult && (
          <Card className="glass-effect border-white/20 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-metro-green/10 to-metro-red/10">
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="h-6 w-6 text-metro-green" />
                Optimal Route Found
                <Badge variant="secondary" className="ml-2">
                  {pathResult.optimizedBy === 'time' ? 'Fastest' : 'Shortest'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="bg-gradient-to-br from-metro-blue/20 to-metro-blue/10 border-metro-blue/30 p-4 text-center">
                  <div className="text-3xl font-bold text-metro-blue">{pathResult.noOfStations}</div>
                  <div className="text-sm text-muted-foreground font-medium">Stations</div>
                </Card>
                <Card className="bg-gradient-to-br from-metro-green/20 to-metro-green/10 border-metro-green/30 p-4 text-center">
                  <div className="text-3xl font-bold text-metro-green flex items-center justify-center gap-1">
                    <Clock className="h-6 w-6" />
                    {pathResult.totalTime}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Minutes</div>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-500/10 border-purple-500/30 p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600 flex items-center justify-center gap-1">
                    <Ruler className="h-5 w-5" />
                    {formatDistance(pathResult.totalDistance)}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Distance</div>
                </Card>
                <Card className="bg-gradient-to-br from-accent-yellow/20 to-accent-yellow/10 border-accent-yellow/30 p-4 text-center">
                  <div className="text-3xl font-bold text-accent-yellow flex items-center justify-center gap-1">
                    <IndianRupee className="h-6 w-6" />
                    {pathResult.fare}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Fare</div>
                </Card>
                <Card className="bg-gradient-to-br from-metro-red/20 to-metro-red/10 border-metro-red/30 p-4 text-center">
                  <div className="text-3xl font-bold text-metro-red">{pathResult.transfers}</div>
                  <div className="text-sm text-muted-foreground font-medium">Transfers</div>
                </Card>
              </div>

              {/* JSON Output Preview */}
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-muted-foreground">API Response Format</h4>
                <pre className="text-xs overflow-x-auto">
{JSON.stringify({
  path: pathResult.path,
  totalDistance: pathResult.totalDistance,
  totalTime: pathResult.totalTime,
  noOfStations: pathResult.noOfStations
}, null, 2)}
                </pre>
              </div>

              {/* Route Path */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Route Path</h3>
                <div className="space-y-2">
                  {pathResult.path.map((station, index) => {
                    const isFirst = index === 0;
                    const isLast = index === pathResult.path.length - 1;
                    const line = getStationLine(station);
                    
                    return (
                      <div key={`${station}-${index}`} className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-4 h-4 rounded-full ${
                            isFirst ? 'bg-green-500' : 
                            isLast ? 'bg-red-500' : 
                            'bg-blue-500'
                          }`} />
                          {!isLast && <div className="w-0.5 h-6 bg-gray-300 mt-1" />}
                        </div>
                        <div className="flex items-center gap-3 flex-1">
                          <Badge className={`text-xs ${getLineColor(line)}`}>
                            {line || 'N/A'}
                          </Badge>
                          <span className="font-medium">{station}</span>
                          {isFirst && <Badge variant="outline" className="text-green-600 border-green-600">Start</Badge>}
                          {isLast && <Badge variant="outline" className="text-red-600 border-red-600">End</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transfer Information */}
              {pathResult.transfers > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Transfer Information</h4>
                  <p className="text-amber-700 dark:text-amber-300 text-sm">
                    This route requires {pathResult.transfers} transfer(s). Additional ₹5 charged per transfer.
                  </p>
                </div>
              )}

              {/* Book Journey Button */}
              <Button 
                onClick={() => navigate('/booking', { 
                  state: { 
                    source: sourceStation, 
                    destination: destinationStation,
                    route: pathResult
                  } 
                })} 
                className="w-full"
                size="lg"
              >
                Book This Journey
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Metro Map Legend */}
        <Card>
          <CardHeader>
            <CardTitle>Metro Lines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Red Line (Miyapur to LB Nagar)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Blue Line (Nagole to Raidurg)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Green Line (JBS Parade Ground to MG Bus Station)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default RouteOptimizer;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { MapPin, Clock, IndianRupee, Route, Navigation, Zap, TrendingUp } from "lucide-react";
import StationSelector, { METRO_STATIONS } from "@/components/StationSelector";
import PageLayout from "@/components/PageLayout";

// Metro stations with connections and weights (time in minutes)
const METRO_GRAPH = {
  // Red Line (Miyapur to LB Nagar)
  "Miyapur": { "JNTU College": 3 },
  "JNTU College": { "Miyapur": 3, "KPHB Colony": 2 },
  "KPHB Colony": { "JNTU College": 2, "Kukatpally": 3 },
  "Kukatpally": { "KPHB Colony": 3, "Balanagar": 3 },
  "Balanagar": { "Kukatpally": 3, "Moosapet": 2 },
  "Moosapet": { "Balanagar": 2, "Bharat Nagar": 3 },
  "Bharat Nagar": { "Moosapet": 3, "Erragadda": 2 },
  "Erragadda": { "Bharat Nagar": 2, "ESI Hospital": 3 },
  "ESI Hospital": { "Erragadda": 3, "SR Nagar": 2 },
  "SR Nagar": { "ESI Hospital": 2, "Ameerpet": 3 },
  "Ameerpet": { "SR Nagar": 3, "Panjagutta": 2, "Madhura Nagar": 2, "Begumpet": 3 }, // Interchange Red-Blue
  "Panjagutta": { "Ameerpet": 2, "Irrum Manzil": 3 },
  "Irrum Manzil": { "Panjagutta": 3, "Khairatabad": 2 },
  "Khairatabad": { "Irrum Manzil": 2, "Lakdi-ka-pul": 3 },
  "Lakdi-ka-pul": { "Khairatabad": 3, "Assembly": 2 },
  "Assembly": { "Lakdi-ka-pul": 2, "Nampally": 3 },
  "Nampally": { "Assembly": 3, "Gandhi Bhavan": 2 },
  "Gandhi Bhavan": { "Nampally": 2, "Osmania Medical College": 3 },
  "Osmania Medical College": { "Gandhi Bhavan": 3, "MG Bus Station": 2 },
  "MG Bus Station": { "Osmania Medical College": 2, "Malakpet": 3, "Sultan Bazaar": 2 }, // Interchange Red-Green
  "Malakpet": { "MG Bus Station": 3, "New Market": 2 },
  "New Market": { "Malakpet": 2, "Moosarambagh": 3 },
  "Moosarambagh": { "New Market": 3, "Dilsukhnagar": 2 },
  "Dilsukhnagar": { "Moosarambagh": 2, "Chaitanyapuri": 3 },
  "Chaitanyapuri": { "Dilsukhnagar": 3, "Victoria Memorial": 2 },
  "Victoria Memorial": { "Chaitanyapuri": 2, "LB Nagar": 3 },
  "LB Nagar": { "Victoria Memorial": 3 },

  // Blue Line (Nagole to Raidurg)
  "Nagole": { "Uppal": 3 },
  "Uppal": { "Nagole": 3, "Stadium": 2 },
  "Stadium": { "Uppal": 2, "NGRI": 3 },
  "NGRI": { "Stadium": 3, "Habsiguda": 2 },
  "Habsiguda": { "NGRI": 2, "Tarnaka": 3 },
  "Tarnaka": { "Habsiguda": 3, "Mettuguda": 2 },
  "Mettuguda": { "Tarnaka": 2, "Secunderabad East": 3 },
  "Secunderabad East": { "Mettuguda": 3, "Parade Ground": 2 },
  "Parade Ground": { "Secunderabad East": 2, "Paradise": 3, "JBS Parade Ground": 0 }, // Interchange Blue-Green
  "Paradise": { "Parade Ground": 3, "Rasoolpura": 2 },
  "Rasoolpura": { "Paradise": 2, "Prakash Nagar": 3 },
  "Prakash Nagar": { "Rasoolpura": 3, "Begumpet": 2 },
  "Begumpet": { "Prakash Nagar": 2, "Ameerpet": 3 },
  "Madhura Nagar": { "Ameerpet": 2, "Yousufguda": 3 },
  "Yousufguda": { "Madhura Nagar": 3, "Jubilee Hills Road No. 5": 2 },
  "Jubilee Hills Road No. 5": { "Yousufguda": 2, "Jubilee Hills Checkpost": 3 },
  "Jubilee Hills Checkpost": { "Jubilee Hills Road No. 5": 3, "Peddamma Gudi": 2 },
  "Peddamma Gudi": { "Jubilee Hills Checkpost": 2, "Madhapur": 3 },
  "Madhapur": { "Peddamma Gudi": 3, "Durgam Cheruvu": 2 },
  "Durgam Cheruvu": { "Madhapur": 2, "Hitech City": 3 },
  "Hitech City": { "Durgam Cheruvu": 3, "Raidurg": 2 },
  "Raidurg": { "Hitech City": 2 },

  // Green Line (JBS Parade Ground to MG Bus Station)
  "JBS Parade Ground": { "Secunderabad West": 3, "Parade Ground": 0 },
  "Secunderabad West": { "JBS Parade Ground": 3, "Gandhi Hospital": 2 },
  "Gandhi Hospital": { "Secunderabad West": 2, "Musheerabad": 3 },
  "Musheerabad": { "Gandhi Hospital": 3, "RTC Cross Roads": 2 },
  "RTC Cross Roads": { "Musheerabad": 2, "Chikkadpally": 3 },
  "Chikkadpally": { "RTC Cross Roads": 3, "Narayanguda": 2 },
  "Narayanguda": { "Chikkadpally": 2, "Sultan Bazaar": 3 },
  "Sultan Bazaar": { "Narayanguda": 3, "MG Bus Station": 2 }
};

const STATION_LINES = {
  // Red Line (Miyapur to LB Nagar)
  "Miyapur": "Red", "JNTU College": "Red", "KPHB Colony": "Red", "Kukatpally": "Red",
  "Balanagar": "Red", "Moosapet": "Red", "Bharat Nagar": "Red", "Erragadda": "Red",
  "ESI Hospital": "Red", "SR Nagar": "Red", "Ameerpet": "Red", "Panjagutta": "Red",
  "Irrum Manzil": "Red", "Khairatabad": "Red", "Lakdi-ka-pul": "Red", "Assembly": "Red",
  "Nampally": "Red", "Gandhi Bhavan": "Red", "Osmania Medical College": "Red",
  "MG Bus Station": "Red", "Malakpet": "Red", "New Market": "Red", "Moosarambagh": "Red",
  "Dilsukhnagar": "Red", "Chaitanyapuri": "Red", "Victoria Memorial": "Red", "LB Nagar": "Red",
  
  // Blue Line (Nagole to Raidurg)
  "Nagole": "Blue", "Uppal": "Blue", "Stadium": "Blue", "NGRI": "Blue",
  "Habsiguda": "Blue", "Tarnaka": "Blue", "Mettuguda": "Blue", "Secunderabad East": "Blue",
  "Parade Ground": "Blue", "Paradise": "Blue", "Rasoolpura": "Blue", "Prakash Nagar": "Blue",
  "Begumpet": "Blue", "Madhura Nagar": "Blue", "Yousufguda": "Blue",
  "Jubilee Hills Road No. 5": "Blue", "Jubilee Hills Checkpost": "Blue", "Peddamma Gudi": "Blue",
  "Madhapur": "Blue", "Durgam Cheruvu": "Blue", "Hitech City": "Blue", "Raidurg": "Blue",
  
  // Green Line (JBS Parade Ground to MG Bus Station)
  "JBS Parade Ground": "Green", "Secunderabad West": "Green", "Gandhi Hospital": "Green",
  "Musheerabad": "Green", "RTC Cross Roads": "Green", "Chikkadpally": "Green",
  "Narayanguda": "Green", "Sultan Bazaar": "Green"
};

interface PathResult {
  path: string[];
  distance: number;
  totalTime: number;
  fare: number;
  transfers: number;
}

const RouteOptimizer = () => {
  const [user, setUser] = useState<any>(null);
  const [sourceStation, setSourceStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [pathResult, setPathResult] = useState<PathResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const stations = Object.keys(METRO_GRAPH).sort();

  useEffect(() => {
    // Remove auth check - allow access without authentication
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  // Dijkstra's Algorithm Implementation
  const dijkstra = (graph: any, start: string, end: string) => {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: string | null } = {};
    const unvisited = new Set<string>();

    // Initialize distances
    for (const vertex in graph) {
      distances[vertex] = vertex === start ? 0 : Infinity;
      previous[vertex] = null;
      unvisited.add(vertex);
    }

    while (unvisited.size > 0) {
      // Find unvisited vertex with minimum distance
      let current = '';
      let minDistance = Infinity;
      
      for (const vertex of unvisited) {
        if (distances[vertex] < minDistance) {
          minDistance = distances[vertex];
          current = vertex;
        }
      }

      if (current === '' || distances[current] === Infinity) break;

      unvisited.delete(current);

      // Check if we reached the destination
      if (current === end) break;

      // Update distances to neighbors
      for (const neighbor in graph[current]) {
        if (unvisited.has(neighbor)) {
          const alt = distances[current] + graph[current][neighbor];
          if (alt < distances[neighbor]) {
            distances[neighbor] = alt;
            previous[neighbor] = current;
          }
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current = end;

    if (previous[current] !== null || current === start) {
      while (current !== null) {
        path.unshift(current);
        current = previous[current];
      }
    }

    return {
      path: path,
      distance: distances[end],
      totalTime: distances[end]
    };
  };

  const calculateFare = (distance: number, transfers: number) => {
    // Base fare: ₹10 for up to 2 stations, ₹15 for 3-5 stations, ₹20 for 6-10 stations, ₹25 for more
    let fare = 10;
    if (distance > 10) fare = 25;
    else if (distance > 5) fare = 20;
    else if (distance > 2) fare = 15;
    
    // Add ₹5 for each transfer
    fare += transfers * 5;
    
    return fare;
  };

  const calculateTransfers = (path: string[]) => {
    if (path.length < 2) return 0;
    
    let transfers = 0;
    let currentLine = STATION_LINES[path[0]];
    
    for (let i = 1; i < path.length; i++) {
      const stationLine = STATION_LINES[path[i]];
      if (stationLine !== currentLine) {
        transfers++;
        currentLine = stationLine;
      }
    }
    
    return Math.max(0, transfers - 1); // First line change doesn't count as transfer
  };

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

    // Simulate processing delay
    setTimeout(() => {
      const result = dijkstra(METRO_GRAPH, sourceStation, destinationStation);
      
      if (result.path.length === 0) {
        toast({
          title: "No route found",
          description: "Unable to find a route between selected stations",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const transfers = calculateTransfers(result.path);
      const fare = calculateFare(result.totalTime, transfers);

      setPathResult({
        path: result.path,
        distance: result.path.length - 1,
        totalTime: result.totalTime,
        fare: fare,
        transfers: transfers
      });

      setLoading(false);

      toast({
        title: "Route Found!",
        description: `Optimal path calculated with ${result.path.length - 1} stops`,
      });
    }, 1500);
  };

  const getLineColor = (line: string) => {
    switch (line) {
      case "Red": return "bg-red-500 text-white";
      case "Blue": return "bg-blue-500 text-white";
      case "Green": return "bg-green-500 text-white";
      case "Airport": return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const clearRoute = () => {
    setSourceStation("");
    setDestinationStation("");
    setPathResult(null);
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-metro-blue/20 to-metro-blue/10 border-metro-blue/30 p-4 text-center">
                  <div className="text-3xl font-bold text-metro-blue">{pathResult.distance}</div>
                  <div className="text-sm text-muted-foreground font-medium">Stations</div>
                </Card>
                <Card className="bg-gradient-to-br from-metro-green/20 to-metro-green/10 border-metro-green/30 p-4 text-center">
                  <div className="text-3xl font-bold text-metro-green flex items-center justify-center gap-1">
                    <Clock className="h-6 w-6" />
                    {pathResult.totalTime}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">Minutes</div>
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

              {/* Route Path */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Route Path</h3>
                <div className="space-y-2">
                  {pathResult.path.map((station, index) => {
                    const isFirst = index === 0;
                    const isLast = index === pathResult.path.length - 1;
                    const line = STATION_LINES[station];
                    
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
                            {line}
                          </Badge>
                          <span className="font-medium">{station}</span>
                          {isFirst && <Badge variant="outline" className="text-green-600 border-green-600">Start</Badge>}
                          {isLast && <Badge variant="outline" className="text-red-600 border-red-600">End</Badge>}
                        </div>
                        {index > 0 && (
                          <span className="text-sm text-muted-foreground">
                            {METRO_GRAPH[pathResult.path[index-1]][station]} min
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transfer Information */}
              {pathResult.transfers > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-semibold text-amber-800 mb-2">Transfer Information</h4>
                  <p className="text-amber-700 text-sm">
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
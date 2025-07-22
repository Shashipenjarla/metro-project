import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, MapPin, Clock, IndianRupee, Route, Navigation } from "lucide-react";

// Metro stations with connections and weights (time in minutes)
const METRO_GRAPH = {
  // Red Line
  "Miyapur": { "JNTU College": 3, "KPHB Colony": 4 },
  "JNTU College": { "Miyapur": 3, "Kukatpally": 2 },
  "KPHB Colony": { "Miyapur": 4, "Kukatpally": 3 },
  "Kukatpally": { "JNTU College": 2, "KPHB Colony": 3, "Balanagar": 4 },
  "Balanagar": { "Kukatpally": 4, "Moosapet": 3 },
  "Moosapet": { "Balanagar": 3, "Bharat Nagar": 2 },
  "Bharat Nagar": { "Moosapet": 2, "Erragadda": 3 },
  "Erragadda": { "Bharat Nagar": 3, "ESI Hospital": 2 },
  "ESI Hospital": { "Erragadda": 2, "SR Nagar": 3 },
  "SR Nagar": { "ESI Hospital": 3, "Ameerpet": 4 },
  "Ameerpet": { "SR Nagar": 4, "Begumpet": 3, "Punjagutta": 4 }, // Interchange
  "Begumpet": { "Ameerpet": 3, "Prakash Nagar": 2 },
  "Prakash Nagar": { "Begumpet": 2, "Rasoolpura": 3 },
  "Rasoolpura": { "Prakash Nagar": 3, "Paradise": 2 },
  "Paradise": { "Rasoolpura": 2, "Parade Ground": 3 },
  "Parade Ground": { "Paradise": 3, "Secunderabad West": 2 },
  "Secunderabad West": { "Parade Ground": 2, "Gandhi Hospital": 4 },
  "Gandhi Hospital": { "Secunderabad West": 4, "Musheerabad": 3 },
  "Musheerabad": { "Gandhi Hospital": 3, "RTC X Roads": 2 },
  "RTC X Roads": { "Musheerabad": 2, "Chikkadpally": 3 },
  "Chikkadpally": { "RTC X Roads": 3, "Narayanguda": 2 },
  "Narayanguda": { "Chikkadpally": 2, "Sultan Bazar": 3 },
  "Sultan Bazar": { "Narayanguda": 3, "MG Bus Station": 2 },
  "MG Bus Station": { "Sultan Bazar": 2, "Malakpet": 4 },
  "Malakpet": { "MG Bus Station": 4, "New Market": 3 },
  "New Market": { "Malakpet": 3, "Musarambagh": 2 },
  "Musarambagh": { "New Market": 2, "Dilsukhnagar": 4 },
  "Dilsukhnagar": { "Musarambagh": 4, "Chaitanyapuri": 3 },
  "Chaitanyapuri": { "Dilsukhnagar": 3, "Victoria Memorial": 2 },
  "Victoria Memorial": { "Chaitanyapuri": 2, "LB Nagar": 4 },
  "LB Nagar": { "Victoria Memorial": 4 },

  // Blue Line
  "Nagole": { "Uppal": 3, "Stadium": 5 },
  "Uppal": { "Nagole": 3, "Survey Settlement": 2 },
  "Survey Settlement": { "Uppal": 2, "Mettuguda": 3 },
  "Mettuguda": { "Survey Settlement": 3, "Tarnaka": 2 },
  "Tarnaka": { "Mettuguda": 2, "Habsiguda": 3 },
  "Habsiguda": { "Tarnaka": 3, "NGRI": 2 },
  "NGRI": { "Habsiguda": 2, "Stadium": 3 },
  "Stadium": { "NGRI": 3, "Nagole": 5, "Arts College": 2 },
  "Arts College": { "Stadium": 2, "Vidya Nagar": 3 },
  "Vidya Nagar": { "Arts College": 3, "Gandhi Nagar": 2 },
  "Gandhi Nagar": { "Vidya Nagar": 2, "Osmania Medical": 3 },
  "Osmania Medical": { "Gandhi Nagar": 3, "MG Bus Station": 2 }, // Interchange
  
  // Green Line
  "Jubilee Bus Station": { "Secunderabad": 4, "Parade Ground": 3 },
  "Secunderabad": { "Jubilee Bus Station": 4, "East Marredpally": 3 },
  "East Marredpally": { "Secunderabad": 3, "Alugadda Bhavi": 2 },
  "Alugadda Bhavi": { "East Marredpally": 2, "Maredpally": 3 },
  "Maredpally": { "Alugadda Bhavi": 3, "Punjagutta": 4 },
  "Punjagutta": { "Maredpally": 4, "Ameerpet": 4, "Irrum Manzil": 3 }, // Interchange
  "Irrum Manzil": { "Punjagutta": 3, "Khairatabad": 2 },
  "Khairatabad": { "Irrum Manzil": 2, "Lakdikapul": 3 },
  "Lakdikapul": { "Khairatabad": 3, "Assembly": 2 },
  "Assembly": { "Lakdikapul": 2, "Nampally": 3 },
  "Nampally": { "Assembly": 3, "Gandhi Bhavan": 2 },
  "Gandhi Bhavan": { "Nampally": 2, "Osmania Medical": 3 },
  
  // Airport Express Line
  "HITEC City": { "Raidurg": 4, "Cyber Towers": 3 },
  "Raidurg": { "HITEC City": 4, "Financial District": 5 },
  "Financial District": { "Raidurg": 5, "Shamshabad Airport": 15 },
  "Shamshabad Airport": { "Financial District": 15 },
  "Cyber Towers": { "HITEC City": 3, "Madhapur": 2 },
  "Madhapur": { "Cyber Towers": 2, "Durgam Cheruvu": 3 },
  "Durgam Cheruvu": { "Madhapur": 3, "Jubilee Hills": 4 },
  "Jubilee Hills": { "Durgam Cheruvu": 4, "Peddamma Gudi": 3 },
  "Peddamma Gudi": { "Jubilee Hills": 3, "Madhapur": 5 }
};

const STATION_LINES = {
  // Red Line
  "Miyapur": "Red", "JNTU College": "Red", "KPHB Colony": "Red", "Kukatpally": "Red",
  "Balanagar": "Red", "Moosapet": "Red", "Bharat Nagar": "Red", "Erragadda": "Red",
  "ESI Hospital": "Red", "SR Nagar": "Red", "Ameerpet": "Red", "Begumpet": "Red",
  "Prakash Nagar": "Red", "Rasoolpura": "Red", "Paradise": "Red", "Parade Ground": "Red",
  "Secunderabad West": "Red", "Gandhi Hospital": "Red", "Musheerabad": "Red",
  "RTC X Roads": "Red", "Chikkadpally": "Red", "Narayanguda": "Red", "Sultan Bazar": "Red",
  "MG Bus Station": "Red", "Malakpet": "Red", "New Market": "Red", "Musarambagh": "Red",
  "Dilsukhnagar": "Red", "Chaitanyapuri": "Red", "Victoria Memorial": "Red", "LB Nagar": "Red",
  
  // Blue Line
  "Nagole": "Blue", "Uppal": "Blue", "Survey Settlement": "Blue", "Mettuguda": "Blue",
  "Tarnaka": "Blue", "Habsiguda": "Blue", "NGRI": "Blue", "Stadium": "Blue",
  "Arts College": "Blue", "Vidya Nagar": "Blue", "Gandhi Nagar": "Blue", "Osmania Medical": "Blue",
  
  // Green Line
  "Jubilee Bus Station": "Green", "Secunderabad": "Green", "East Marredpally": "Green",
  "Alugadda Bhavi": "Green", "Maredpally": "Green", "Punjagutta": "Green",
  "Irrum Manzil": "Green", "Khairatabad": "Green", "Lakdikapul": "Green",
  "Assembly": "Green", "Nampally": "Green", "Gandhi Bhavan": "Green",
  
  // Airport Express Line
  "HITEC City": "Airport", "Raidurg": "Airport", "Financial District": "Airport",
  "Shamshabad Airport": "Airport", "Cyber Towers": "Airport", "Madhapur": "Airport",
  "Durgam Cheruvu": "Airport", "Jubilee Hills": "Airport", "Peddamma Gudi": "Airport"
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Metro Route Optimizer
            </CardTitle>
            <CardDescription>
              Find the shortest path between metro stations using Dijkstra's Algorithm
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Source Station</label>
                <Select value={sourceStation} onValueChange={setSourceStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station} value={station}>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getLineColor(STATION_LINES[station])}`}>
                            {STATION_LINES[station]}
                          </Badge>
                          {station}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Destination Station</label>
                <Select value={destinationStation} onValueChange={setDestinationStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station} value={station}>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${getLineColor(STATION_LINES[station])}`}>
                            {STATION_LINES[station]}
                          </Badge>
                          {station}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={findOptimalRoute} 
                disabled={loading || !sourceStation || !destinationStation}
                className="flex-1"
              >
                <Navigation className="h-4 w-4 mr-2" />
                {loading ? "Finding Route..." : "Find Optimal Route"}
              </Button>
              <Button variant="outline" onClick={clearRoute}>
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Route Result */}
        {pathResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Optimal Route Found
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Route Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{pathResult.distance}</div>
                  <div className="text-sm text-muted-foreground">Stations</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <Clock className="h-5 w-5" />
                    {pathResult.totalTime}
                  </div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                    <IndianRupee className="h-5 w-5" />
                    {pathResult.fare}
                  </div>
                  <div className="text-sm text-muted-foreground">Fare</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{pathResult.transfers}</div>
                  <div className="text-sm text-muted-foreground">Transfers</div>
                </div>
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm">Red Line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Blue Line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-sm">Green Line</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm">Airport Line</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RouteOptimizer;
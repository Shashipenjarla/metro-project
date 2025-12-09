import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Car, Bike, Ticket, CreditCard, Clock, Info, Navigation, Bus } from "lucide-react";
import StationSelector, { METRO_STATIONS as SELECTOR_STATIONS } from "@/components/StationSelector";
import PageLayout from "@/components/PageLayout";
import { useJourneyState } from "@/hooks/useJourneyState";

interface Station {
  id: string;
  name: string;
  has_parking: boolean;
  parking_two_wheeler_slots: number;
  parking_four_wheeler_slots: number;
}

// Complete Hyderabad Metro stations data - All Lines
const METRO_STATIONS: Station[] = [
  // Blue Line (Nagole to Raidurg)
  { id: "1", name: "Nagole", has_parking: true, parking_two_wheeler_slots: 100, parking_four_wheeler_slots: 50 },
  { id: "2", name: "Uppal", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "3", name: "Survey Settlement", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "4", name: "NGRI", has_parking: true, parking_two_wheeler_slots: 60, parking_four_wheeler_slots: 30 },
  { id: "5", name: "Habsiguda", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "6", name: "Tarnaka", has_parking: true, parking_two_wheeler_slots: 70, parking_four_wheeler_slots: 35 },
  { id: "7", name: "Mettuguda", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "8", name: "Secunderabad East", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  { id: "9", name: "Parade Ground", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "10", name: "Secunderabad West", has_parking: true, parking_two_wheeler_slots: 150, parking_four_wheeler_slots: 75 },
  { id: "11", name: "Gandhi Hospital", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "12", name: "Musheerabad", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "13", name: "RTC X Roads", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "14", name: "Chikkadpally", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "15", name: "Narayanguda", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "16", name: "Sultan Bazar", has_parking: true, parking_two_wheeler_slots: 70, parking_four_wheeler_slots: 35 },
  { id: "17", name: "MG Bus Station", has_parking: true, parking_two_wheeler_slots: 200, parking_four_wheeler_slots: 100 },
  { id: "18", name: "Malakpet", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "19", name: "New Market", has_parking: true, parking_two_wheeler_slots: 60, parking_four_wheeler_slots: 30 },
  { id: "20", name: "Musarambagh", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "21", name: "Dilsukhnagar", has_parking: true, parking_two_wheeler_slots: 110, parking_four_wheeler_slots: 55 },
  { id: "22", name: "Chaitanyapuri", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "23", name: "Victoria Memorial", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "24", name: "LB Nagar", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  
  // Red Line (Miyapur to LB Nagar)
  { id: "25", name: "Miyapur", has_parking: true, parking_two_wheeler_slots: 200, parking_four_wheeler_slots: 100 },
  { id: "26", name: "JNTU College", has_parking: true, parking_two_wheeler_slots: 150, parking_four_wheeler_slots: 75 },
  { id: "27", name: "KPHB Colony", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  { id: "28", name: "Kukatpally", has_parking: true, parking_two_wheeler_slots: 180, parking_four_wheeler_slots: 90 },
  { id: "29", name: "Balanagar", has_parking: true, parking_two_wheeler_slots: 100, parking_four_wheeler_slots: 50 },
  { id: "30", name: "Moosapet", has_parking: true, parking_two_wheeler_slots: 85, parking_four_wheeler_slots: 40 },
  { id: "31", name: "Bharat Nagar", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "32", name: "Erragadda", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "33", name: "ESI Hospital", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "34", name: "SR Nagar", has_parking: true, parking_two_wheeler_slots: 70, parking_four_wheeler_slots: 35 },
  { id: "35", name: "Ameerpet", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "36", name: "Punjagutta", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "37", name: "Irrum Manzil", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "38", name: "Khairatabad", has_parking: true, parking_two_wheeler_slots: 60, parking_four_wheeler_slots: 30 },
  { id: "39", name: "Lakdikapool", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "40", name: "Assembly", has_parking: true, parking_two_wheeler_slots: 50, parking_four_wheeler_slots: 25 },
  { id: "41", name: "Nampally", has_parking: true, parking_two_wheeler_slots: 100, parking_four_wheeler_slots: 50 },
  { id: "42", name: "Gandhi Bhavan", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "43", name: "Osmania Medical College", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "44", name: "MG Bus Station", has_parking: true, parking_two_wheeler_slots: 200, parking_four_wheeler_slots: 100 },
  
  // Green Line (Nagole to Shilparamam/Hi-Tech City)
  { id: "45", name: "JBS Parade Ground", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  { id: "46", name: "Secunderabad", has_parking: true, parking_two_wheeler_slots: 180, parking_four_wheeler_slots: 90 },
  { id: "47", name: "Gandhi Hospital", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "48", name: "Musheerabad", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "49", name: "RTC X Roads", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "50", name: "Chikkadpally", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "51", name: "Narayanguda", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "52", name: "Sultan Bazar", has_parking: true, parking_two_wheeler_slots: 70, parking_four_wheeler_slots: 35 },
  { id: "53", name: "MG Bus Station", has_parking: true, parking_two_wheeler_slots: 200, parking_four_wheeler_slots: 100 },
  { id: "54", name: "Osmania Medical College", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "55", name: "Gandhi Bhavan", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "56", name: "Nampally", has_parking: true, parking_two_wheeler_slots: 100, parking_four_wheeler_slots: 50 },
  { id: "57", name: "Assembly", has_parking: true, parking_two_wheeler_slots: 50, parking_four_wheeler_slots: 25 },
  { id: "58", name: "Lakdikapool", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "59", name: "Khairatabad", has_parking: true, parking_two_wheeler_slots: 60, parking_four_wheeler_slots: 30 },
  { id: "60", name: "Irrum Manzil", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "61", name: "Punjagutta", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "62", name: "Ameerpet", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "63", name: "Begumpet", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "64", name: "Prakash Nagar", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "65", name: "Rasoolpura", has_parking: true, parking_two_wheeler_slots: 70, parking_four_wheeler_slots: 35 },
  { id: "66", name: "JBS Parade Ground", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  
  // Additional Important Stations
  { id: "67", name: "Raidurg", has_parking: true, parking_two_wheeler_slots: 150, parking_four_wheeler_slots: 75 },
  { id: "68", name: "Hi-Tech City", has_parking: true, parking_two_wheeler_slots: 300, parking_four_wheeler_slots: 150 },
  { id: "69", name: "Madhapur", has_parking: true, parking_two_wheeler_slots: 200, parking_four_wheeler_slots: 100 },
  { id: "70", name: "Durgam Cheruvu", has_parking: true, parking_two_wheeler_slots: 100, parking_four_wheeler_slots: 50 },
  { id: "71", name: "Jubilee Hills Checkpost", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  { id: "72", name: "Jubilee Hills", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "73", name: "Yusufguda", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "74", name: "Madhura Nagar", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "75", name: "Peddamma Gudi", has_parking: true, parking_two_wheeler_slots: 70, parking_four_wheeler_slots: 35 },
];

const Booking = () => {
  const location = useLocation();
  const { getBookingSource, getBookingDestination, clearJourneyState } = useJourneyState();
  const [stations] = useState<Station[]>(METRO_STATIONS);
  const [sourceStation, setSourceStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [needsParking, setNeedsParking] = useState(false);
  const [parkingStation, setParkingStation] = useState("");
  const [parkingType, setParkingType] = useState<"two_wheeler" | "four_wheeler">("two_wheeler");
  const [needsTransport, setNeedsTransport] = useState(false);
  const [transportLocation, setTransportLocation] = useState<"source" | "destination" | "both">("destination");
  const [transportType, setTransportType] = useState<"auto" | "cab" | "bus" | "shuttle">("cab");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [prefillSource, setPrefillSource] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper function to resolve station value to ID
  const resolveStationToId = (stationValue: string): string => {
    // If it's already an ID, return it
    const byId = METRO_STATIONS.find(s => s.id === stationValue);
    if (byId) return stationValue;
    
    // If it's a name, find the matching station and return its ID
    const byName = METRO_STATIONS.find(s => s.name === stationValue);
    if (byName) return byName.id;
    
    // Also check SELECTOR_STATIONS
    const selectorById = SELECTOR_STATIONS.find(s => s.id === stationValue);
    if (selectorById) return stationValue;
    
    const selectorByName = SELECTOR_STATIONS.find(s => s.name === stationValue);
    if (selectorByName) return selectorByName.id;
    
    // Fallback to original value
    return stationValue;
  };

  // Check for prefilled stations from Route Optimizer or Smart Parking
  useEffect(() => {
    // Priority 1: Check navigation state (from Route Optimizer "Book This Journey" button)
    const navState = location.state as { source?: string; destination?: string } | null;
    if (navState?.source) {
      setSourceStation(resolveStationToId(navState.source));
      setPrefillSource('Route Optimizer');
    }
    if (navState?.destination) {
      setDestinationStation(resolveStationToId(navState.destination));
    }

    // Priority 2: Check journey state (from localStorage)
    if (!navState?.source) {
      const storedSource = getBookingSource();
      const storedDest = getBookingDestination();
      
      if (storedSource) {
        setSourceStation(resolveStationToId(storedSource));
        setPrefillSource(storedDest ? 'Route Optimizer' : 'Smart Parking');
      }
      if (storedDest) {
        setDestinationStation(resolveStationToId(storedDest));
      }
    }
  }, [location.state]);

  useEffect(() => {
    // Remove auth check - allow access without authentication
  }, []);

  const calculateFare = () => {
    if (!sourceStation || !destinationStation) return 10;
    
    // Find the actual station objects using imported SELECTOR_STATIONS
    const source = SELECTOR_STATIONS.find(s => s.id === sourceStation);
    const dest = SELECTOR_STATIONS.find(s => s.id === destinationStation);
    
    if (!source || !dest) return 10;
    
    // Get the index position of each station in the array
    const sourceIndex = SELECTOR_STATIONS.findIndex(s => s.id === sourceStation);
    const destIndex = SELECTOR_STATIONS.findIndex(s => s.id === destinationStation);
    
    // Calculate distance based on number of stations between them
    const stationDistance = Math.abs(destIndex - sourceIndex);
    
    // Realistic Hyderabad Metro fare structure:
    // 1-3 stations: ₹10, 4-6 stations: ₹20, 7-12 stations: ₹30
    // 13-18 stations: ₹40, 19-25 stations: ₹50, 26+ stations: ₹60
    let fare = 10;
    if (stationDistance <= 3) fare = 10;
    else if (stationDistance <= 6) fare = 20;
    else if (stationDistance <= 12) fare = 30;
    else if (stationDistance <= 18) fare = 40;
    else if (stationDistance <= 25) fare = 50;
    else fare = 60;
    
    return fare;
  };

  const handleBooking = async () => {
    if (!sourceStation || !destinationStation || !travelDate || !travelTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (sourceStation === destinationStation) {
      toast({
        title: "Invalid Selection",
        description: "Source and destination stations cannot be the same",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const fare = calculateFare();
      const totalAmount = fare * passengerCount;

      // Create mock booking data (will be replaced with real database calls later)
      const ticketId = `TKT-${Date.now()}`;
      const qrData = {
        ticketId,
        source: stations.find(s => s.id === sourceStation)?.name || sourceStation,
        destination: stations.find(s => s.id === destinationStation)?.name || destinationStation,
        date: travelDate,
        time: travelTime,
        passengers: passengerCount,
        amount: totalAmount
      };

      const ticketBooking = {
        id: ticketId,
        user_id: user?.id || null,
        source_station_id: sourceStation,
        destination_station_id: destinationStation,
        travel_date: travelDate,
        travel_time: travelTime,
        passenger_count: passengerCount,
        total_amount: totalAmount,
        booking_status: "confirmed",
        qr_data: JSON.stringify(qrData)
      };

      let parkingBooking = null;
      if (needsParking && parkingStation) {
        parkingBooking = {
          id: `parking_${Date.now()}`,
          user_id: user?.id || null,
          station_id: parkingStation,
          vehicle_type: parkingType,
          booking_date: travelDate,
          booking_time: travelTime,
          booking_status: "confirmed"
        };
      }

      let transportBooking = null;
      if (needsTransport) {
        transportBooking = {
          id: `transport_${Date.now()}`,
          user_id: user?.id || null,
          transport_type: transportType,
          location: transportLocation,
          source_station: transportLocation === "source" || transportLocation === "both" ? sourceStation : null,
          destination_station: transportLocation === "destination" || transportLocation === "both" ? destinationStation : null,
          booking_date: travelDate,
          booking_time: travelTime,
          booking_status: "confirmed"
        };
      }

      toast({
        title: "Booking Confirmed!",
        description: `Your ticket has been booked for ₹${totalAmount}`,
      });

      // Navigate to confirmation page with booking details
      // Look up station names by ID first, fallback to name match, then use raw value
      const getStationName = (stationValue: string) => {
        const byId = stations.find(s => s.id === stationValue);
        if (byId) return byId.name;
        const byName = stations.find(s => s.name === stationValue);
        if (byName) return byName.name;
        return stationValue; // Fallback to raw value if it's already a name
      };

      navigate("/confirmation", {
        state: {
          ticketBooking,
          parkingBooking,
          transportBooking,
          sourceStationName: getStationName(sourceStation),
          destinationStationName: getStationName(destinationStation),
          parkingStationName: parkingStation ? getStationName(parkingStation) : undefined,
          transportType: needsTransport ? transportType : undefined,
          transportLocation: needsTransport ? transportLocation : undefined
        }
      });

    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parkingStations = stations.filter(station => station.has_parking);

  return (
    <PageLayout title="Book Metro Tickets" subtitle="Quick and easy metro ticket booking with smart pricing">
      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="glass-effect border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-metro-blue/10 via-metro-green/10 to-metro-red/10 rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Ticket className="h-6 w-6 text-metro-blue" />
              Book Metro Ticket
            </CardTitle>
            <CardDescription className="text-base">
              Select your journey details and book your metro ticket with real-time fare calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Prefill Info Banner */}
            {prefillSource && (
              <div className="flex items-center gap-2 p-3 bg-metro-blue/10 border border-metro-blue/20 rounded-lg">
                <Info className="h-4 w-4 text-metro-blue" />
                <span className="text-sm text-metro-blue">
                  Stations pre-filled from {prefillSource}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSourceStation("");
                    setDestinationStation("");
                    setPrefillSource(null);
                    clearJourneyState();
                  }}
                  className="ml-auto text-xs h-6"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Station Selection */}
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

            {/* Fare Preview */}
            {sourceStation && destinationStation && sourceStation !== destinationStation && (
              <Card className="bg-gradient-to-r from-metro-green/10 to-metro-blue/10 border-metro-green/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard className="h-5 w-5 text-metro-green" />
                    <h3 className="text-lg font-semibold">Fare Calculation</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fare per passenger:</span>
                      <span className="font-semibold text-lg">₹{calculateFare()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium">Total for {passengerCount} passenger(s):</span>
                      <span className="font-bold text-2xl text-metro-green">₹{calculateFare() * passengerCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="travel-date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Travel Date
                </Label>
                <Input
                  id="travel-date"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travel-time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Travel Time
                </Label>
                <Input
                  id="travel-time"
                  type="time"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            {/* Passenger Count */}
            <div className="space-y-2">
              <Label htmlFor="passenger-count" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Passengers
              </Label>
              <div className="grid grid-cols-6 gap-3">
                {[1, 2, 3, 4, 5, 6].map((count) => (
                  <Button
                    key={count}
                    variant={passengerCount === count ? "default" : "outline"}
                    onClick={() => setPassengerCount(count)}
                    className="h-12 text-lg font-semibold"
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>

            {/* Parking Option */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs-parking"
                    checked={needsParking}
                    onCheckedChange={(checked) => {
                      setNeedsParking(checked as boolean);
                      // Auto-select source station for parking when enabled
                      if (checked && sourceStation && !parkingStation) {
                        setParkingStation(sourceStation);
                      }
                    }}
                  />
                  <Label htmlFor="needs-parking" className="flex items-center gap-2 text-base font-medium cursor-pointer">
                    <Car className="h-5 w-5 text-metro-blue" />
                    I need parking at departure station
                  </Label>
                </div>
              </CardHeader>

              {needsParking && (
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2">
                    <Label>Parking Station</Label>
                    <Select value={parkingStation} onValueChange={setParkingStation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parking station" />
                      </SelectTrigger>
                      <SelectContent>
                        {parkingStations.map((station) => (
                          <SelectItem key={station.id} value={station.id}>
                            {station.name} ({station.parking_two_wheeler_slots + station.parking_four_wheeler_slots} slots available)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Vehicle Type</Label>
                    <Select value={parkingType} onValueChange={(value) => setParkingType(value as "two_wheeler" | "four_wheeler")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="two_wheeler">
                          <div className="flex items-center gap-2">
                            <Bike className="h-4 w-4" />
                            Two Wheeler (₹20/day)
                          </div>
                        </SelectItem>
                        <SelectItem value="four_wheeler">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Four Wheeler (₹50/day)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {parkingStation && (
                    <div className="p-3 bg-metro-green/10 border border-metro-green/20 rounded-lg">
                      <p className="text-sm text-metro-green">
                        ✓ Parking will be reserved at {stations.find(s => s.id === parkingStation)?.name || parkingStation}
                      </p>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>

            {/* Post Station Transportation Option */}
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="needs-transport"
                    checked={needsTransport}
                    onCheckedChange={(checked) => setNeedsTransport(checked as boolean)}
                  />
                  <Label htmlFor="needs-transport" className="flex items-center gap-2 text-base font-medium cursor-pointer">
                    <Navigation className="h-5 w-5 text-metro-green" />
                    I need post-station transportation
                  </Label>
                </div>
              </CardHeader>

              {needsTransport && (
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-3">
                    <Label>Where do you need transportation?</Label>
                    <RadioGroup 
                      value={transportLocation} 
                      onValueChange={(value) => setTransportLocation(value as "source" | "destination" | "both")}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="source" id="transport-source" />
                        <Label htmlFor="transport-source" className="cursor-pointer flex-1">
                          <div className="font-medium">At Departure</div>
                          <div className="text-xs text-muted-foreground">Pickup from source station</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="destination" id="transport-destination" />
                        <Label htmlFor="transport-destination" className="cursor-pointer flex-1">
                          <div className="font-medium">At Arrival</div>
                          <div className="text-xs text-muted-foreground">Drop at destination</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="both" id="transport-both" />
                        <Label htmlFor="transport-both" className="cursor-pointer flex-1">
                          <div className="font-medium">Both Stations</div>
                          <div className="text-xs text-muted-foreground">Pickup & Drop</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Transportation Type</Label>
                    <Select value={transportType} onValueChange={(value) => setTransportType(value as "auto" | "cab" | "bus" | "shuttle")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">
                          <div className="flex items-center gap-2">
                            🛺 Auto Rickshaw (₹50-100)
                          </div>
                        </SelectItem>
                        <SelectItem value="cab">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Cab (Ola/Uber) (₹100-200)
                          </div>
                        </SelectItem>
                        <SelectItem value="bus">
                          <div className="flex items-center gap-2">
                            <Bus className="h-4 w-4" />
                            TSRTC Bus (₹10-30)
                          </div>
                        </SelectItem>
                        <SelectItem value="shuttle">
                          <div className="flex items-center gap-2">
                            🚐 Metro Feeder Shuttle (₹15)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm font-medium mb-1">Transport Summary</p>
                    <p className="text-xs text-muted-foreground">
                      {transportLocation === "source" && sourceStation && 
                        `${transportType.charAt(0).toUpperCase() + transportType.slice(1)} pickup from ${stations.find(s => s.id === sourceStation)?.name || 'source station'}`}
                      {transportLocation === "destination" && destinationStation && 
                        `${transportType.charAt(0).toUpperCase() + transportType.slice(1)} drop at ${stations.find(s => s.id === destinationStation)?.name || 'destination station'}`}
                      {transportLocation === "both" && 
                        `${transportType.charAt(0).toUpperCase() + transportType.slice(1)} at both stations`}
                      {!sourceStation && !destinationStation && "Select stations to see transport details"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const targetStation = transportLocation === "source" ? sourceStation : destinationStation;
                      if (targetStation) {
                        const stationName = stations.find(s => s.id === targetStation)?.name || targetStation;
                        navigate('/post-station-transport', { state: { preselectedStation: stationName } });
                      } else {
                        navigate('/post-station-transport');
                      }
                    }}
                    className="w-full"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Explore All Transport Options
                  </Button>
                </CardContent>
              )}
            </Card>

            <Button 
              onClick={handleBooking} 
              className="w-full" 
              disabled={loading}
              size="lg"
            >
              {loading ? "Processing..." : "Confirm Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
};

export default Booking;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Car, Bike } from "lucide-react";

interface Station {
  id: string;
  name: string;
  has_parking: boolean;
  parking_two_wheeler_slots: number;
  parking_four_wheeler_slots: number;
}

// Sample Hyderabad Metro stations data
const METRO_STATIONS: Station[] = [
  { id: "1", name: "Nagole", has_parking: true, parking_two_wheeler_slots: 100, parking_four_wheeler_slots: 50 },
  { id: "2", name: "Uppal", has_parking: true, parking_two_wheeler_slots: 80, parking_four_wheeler_slots: 40 },
  { id: "3", name: "Stadium", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "4", name: "NGRI", has_parking: true, parking_two_wheeler_slots: 60, parking_four_wheeler_slots: 30 },
  { id: "5", name: "Habsiguda", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "6", name: "LB Nagar", has_parking: true, parking_two_wheeler_slots: 120, parking_four_wheeler_slots: 60 },
  { id: "7", name: "Victoria Memorial", has_parking: false, parking_two_wheeler_slots: 0, parking_four_wheeler_slots: 0 },
  { id: "8", name: "Chaitanyapuri", has_parking: true, parking_two_wheeler_slots: 90, parking_four_wheeler_slots: 45 },
  { id: "9", name: "Dilsukhnagar", has_parking: true, parking_two_wheeler_slots: 110, parking_four_wheeler_slots: 55 },
  { id: "10", name: "Moosapet", has_parking: true, parking_two_wheeler_slots: 85, parking_four_wheeler_slots: 40 },
];

const Booking = () => {
  const [stations] = useState<Station[]>(METRO_STATIONS);
  const [sourceStation, setSourceStation] = useState("");
  const [destinationStation, setDestinationStation] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travelTime, setTravelTime] = useState("");
  const [passengerCount, setPassengerCount] = useState(1);
  const [needsParking, setNeedsParking] = useState(false);
  const [parkingStation, setParkingStation] = useState("");
  const [parkingType, setParkingType] = useState<"two_wheeler" | "four_wheeler">("two_wheeler");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

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

  const calculateFare = () => {
    // Simple fare calculation based on station distance
    const sourceIndex = stations.findIndex(s => s.id === sourceStation);
    const destIndex = stations.findIndex(s => s.id === destinationStation);
    const distance = Math.abs(destIndex - sourceIndex);
    
    // Base fare + distance-based fare (mimicking real metro pricing)
    const baseFare = 11;
    const distanceFare = distance * 2;
    return Math.min(baseFare + distanceFare, 69); // Max fare as per Hyderabad Metro
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
      const ticketBooking = {
        id: `ticket_${Date.now()}`,
        user_id: user.id,
        source_station_id: sourceStation,
        destination_station_id: destinationStation,
        travel_date: travelDate,
        travel_time: travelTime,
        passenger_count: passengerCount,
        total_amount: totalAmount,
        booking_status: "confirmed"
      };

      let parkingBooking = null;
      if (needsParking && parkingStation) {
        parkingBooking = {
          id: `parking_${Date.now()}`,
          user_id: user.id,
          station_id: parkingStation,
          vehicle_type: parkingType,
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
      navigate("/confirmation", {
        state: {
          ticketBooking,
          parkingBooking,
          sourceStationName: stations.find(s => s.id === sourceStation)?.name,
          destinationStationName: stations.find(s => s.id === destinationStation)?.name,
          parkingStationName: stations.find(s => s.id === parkingStation)?.name
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
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="mb-4"
        >
          ← Back to Home
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Book Metro Ticket
            </CardTitle>
            <CardDescription>
              Select your journey details and book your metro ticket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Station Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source Station</Label>
                <Select value={sourceStation} onValueChange={setSourceStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destination Station</Label>
                <Select value={destinationStation} onValueChange={setDestinationStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.map((station) => (
                      <SelectItem key={station.id} value={station.id}>
                        {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fare Preview */}
            {sourceStation && destinationStation && sourceStation !== destinationStation && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Fare per passenger:</span>
                    <span className="font-semibold">₹{calculateFare()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total for {passengerCount} passenger(s):</span>
                    <span className="font-bold text-lg">₹{calculateFare() * passengerCount}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="travel-date">Travel Date</Label>
                <Input
                  id="travel-date"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="travel-time">Travel Time</Label>
                <Input
                  id="travel-time"
                  type="time"
                  value={travelTime}
                  onChange={(e) => setTravelTime(e.target.value)}
                />
              </div>
            </div>

            {/* Passenger Count */}
            <div className="space-y-2">
              <Label htmlFor="passenger-count" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Passengers
              </Label>
              <Select value={passengerCount.toString()} onValueChange={(value) => setPassengerCount(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} Passenger{count > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Parking Option */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="needs-parking"
                  checked={needsParking}
                  onCheckedChange={(checked) => setNeedsParking(checked as boolean)}
                />
                <Label htmlFor="needs-parking" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  I need parking
                </Label>
              </div>

              {needsParking && (
                <div className="space-y-4 pl-6 border-l-2 border-border">
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
                            Two Wheeler
                          </div>
                        </SelectItem>
                        <SelectItem value="four_wheeler">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4" />
                            Four Wheeler
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

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
    </div>
  );
};

export default Booking;
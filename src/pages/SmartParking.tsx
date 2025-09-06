import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, MapPin, Car, Bike, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ParkingAvailability {
  id: string;
  station_id: string;
  station_name: string;
  vehicle_type: string;
  total_slots: number;
  occupied_slots: number;
  date: string;
}

interface ParkingBooking {
  id: string;
  station_id: string;
  station_name: string;
  vehicle_type: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  slot_number: number;
  amount: number;
  status: string;
}

const SmartParking = () => {
  const navigate = useNavigate();
  const [parkingData, setParkingData] = useState<ParkingAvailability[]>([]);
  const [userBookings, setUserBookings] = useState<ParkingBooking[]>([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [vehicleType, setVehicleType] = useState<'two_wheeler' | 'four_wheeler'>('two_wheeler');
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    fetchParkingData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchParkingData = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_availability')
        .select('*')
        .order('station_name');

      if (error) throw error;
      setParkingData(data || []);
    } catch (error) {
      console.error('Error fetching parking data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parking availability",
        variant: "destructive",
      });
    }
  };

  const fetchUserBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('parking_bookings')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserBookings(data || []);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  const calculateAmount = () => {
    if (!startTime || !endTime) return 0;
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
    
    return vehicleType === 'two_wheeler' ? hours * 10 : hours * 20;
  };

  const handleBooking = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!selectedStation || !bookingDate || !startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    if (startTime >= endTime) {
      toast({
        title: "Error", 
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const selectedStationData = parkingData.find(
        p => p.station_id === selectedStation && p.vehicle_type === vehicleType
      );

      if (!selectedStationData) {
        throw new Error('Station not found');
      }

      if (selectedStationData.occupied_slots >= selectedStationData.total_slots) {
        toast({
          title: "Error",
          description: "No parking slots available at this station",
          variant: "destructive",
        });
        return;
      }

      const amount = calculateAmount();
      const slotNumber = selectedStationData.occupied_slots + 1;

      const { error } = await supabase
        .from('parking_bookings')
        .insert({
          user_id: user.id,
          station_id: selectedStation,
          station_name: selectedStationData.station_name,
          vehicle_type: vehicleType,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          slot_number: slotNumber,
          amount: amount,
        });

      if (error) throw error;

      // Update availability
      await supabase
        .from('parking_availability')
        .update({
          occupied_slots: selectedStationData.occupied_slots + 1
        })
        .eq('id', selectedStationData.id);

      toast({
        title: "Success",
        description: `Parking slot ${slotNumber} booked successfully!`,
      });

      // Reset form
      setSelectedStation("");
      setBookingDate("");
      setStartTime("");
      setEndTime("");
      
      // Refresh data
      fetchParkingData();
      fetchUserBookings();
    } catch (error) {
      console.error('Error booking parking:', error);
      toast({
        title: "Error",
        description: "Failed to book parking slot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailabilityStatus = (occupied: number, total: number) => {
    const percentage = (occupied / total) * 100;
    if (percentage >= 90) return { status: 'full', color: 'destructive' as const };
    if (percentage >= 70) return { status: 'limited', color: 'secondary' as const };
    return { status: 'available', color: 'default' as const };
  };

  const stationsWithParking = parkingData.reduce((acc, curr) => {
    if (!acc.find(station => station.station_id === curr.station_id)) {
      acc.push(curr);
    }
    return acc;
  }, [] as ParkingAvailability[]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Smart Parking</h1>
          <p className="text-muted-foreground">Book parking slots at metro stations</p>
        </div>

        {/* Parking Availability Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stationsWithParking.map((station) => {
            const twoWheeler = parkingData.find(p => p.station_id === station.station_id && p.vehicle_type === 'two_wheeler');
            const fourWheeler = parkingData.find(p => p.station_id === station.station_id && p.vehicle_type === 'four_wheeler');
            
            return (
              <Card key={station.station_id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{station.station_name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {twoWheeler && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bike className="h-4 w-4" />
                        <span className="text-sm">Two Wheeler</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{twoWheeler.occupied_slots}/{twoWheeler.total_slots}</span>
                        <Badge variant={getAvailabilityStatus(twoWheeler.occupied_slots, twoWheeler.total_slots).color}>
                          {getAvailabilityStatus(twoWheeler.occupied_slots, twoWheeler.total_slots).status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {fourWheeler && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        <span className="text-sm">Four Wheeler</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{fourWheeler.occupied_slots}/{fourWheeler.total_slots}</span>
                        <Badge variant={getAvailabilityStatus(fourWheeler.occupied_slots, fourWheeler.total_slots).color}>
                          {getAvailabilityStatus(fourWheeler.occupied_slots, fourWheeler.total_slots).status}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Booking Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Book Parking Slot
            </CardTitle>
            <CardDescription>
              Reserve your parking spot in advance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="station">Station</Label>
                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stationsWithParking.map((station) => (
                      <SelectItem key={station.station_id} value={station.station_id}>
                        {station.station_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle-type">Vehicle Type</Label>
                <Select value={vehicleType} onValueChange={(value: 'two_wheeler' | 'four_wheeler') => setVehicleType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="two_wheeler">Two Wheeler</SelectItem>
                    <SelectItem value="four_wheeler">Four Wheeler</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="space-y-2">
                <Label>Amount</Label>
                <div className="text-2xl font-bold text-primary">
                  ₹{calculateAmount()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {vehicleType === 'two_wheeler' ? '₹10/hour' : '₹20/hour'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleBooking} 
              disabled={isLoading} 
              className="w-full"
              size="lg"
            >
              {isLoading ? "Booking..." : "Book Parking Slot"}
            </Button>
          </CardContent>
        </Card>

        {/* My Bookings */}
        {userBookings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                My Parking Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{booking.station_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {booking.vehicle_type === 'two_wheeler' ? 'Two Wheeler' : 'Four Wheeler'} • Slot #{booking.slot_number}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {booking.booking_date} • {booking.start_time} - {booking.end_time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{booking.amount}</p>
                      <Badge variant="secondary">{booking.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SmartParking;
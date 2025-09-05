import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Train, MapPin, CreditCard, Wallet, Route, User, LogOut, UtensilsCrossed, Clock, Heart, MessageSquare, Search, Mic } from "lucide-react";
import VoiceAssistant from '@/components/VoiceAssistant';

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Train className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Smart Metro</h1>
          </div>
          
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">An Intelligent and Inclusive Metro Companion</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Book your metro tickets, reserve parking slots, and manage your smart card all in one place
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-6 max-w-full mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/booking" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Train className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Book Tickets</CardTitle>
              <CardDescription>
                Select stations, choose travel time, and book your metro tickets instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Book Now" : "Sign In to Book"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Parking Slots</CardTitle>
              <CardDescription>
                Reserve parking for two-wheelers and four-wheelers at metro stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/smart-card" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Smart Card</CardTitle>
              <CardDescription>
                Check balance and recharge your metro smart card digitally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Manage Card" : "Sign In to Access"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/virtual-card" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Virtual E-Card</CardTitle>
              <CardDescription>
                Create a digital contactless metro card with QR code for seamless travel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Create E-Card" : "Sign In to Create"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/route-optimizer" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Route className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Route Optimizer</CardTitle>
              <CardDescription>
                Find the shortest path between stations using smart algorithms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Find Route" : "Sign In to Access"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/metro-arrivals" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Live Arrivals</CardTitle>
              <CardDescription>
                Real-time metro arrival notifications with delay status and ETAs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "View Arrivals" : "Sign In to Access"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/food-stalls" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <UtensilsCrossed className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Food Stalls</CardTitle>
              <CardDescription>
                Order delicious food from stalls at metro stations with UPI payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Order Food" : "Sign In to Order"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/accessibility-assistance" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Accessibility</CardTitle>
              <CardDescription>
                Request assistance for specially-abled passengers at metro stations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Get Help" : "Sign In to Access"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/feedback" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Feedback</CardTitle>
              <CardDescription>
                Share your experience and suggestions for metro services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Give Feedback" : "Sign In to Give Feedback"}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(user ? "/lost-and-found" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Lost & Found</CardTitle>
              <CardDescription>
                Report lost items or find belongings with smart matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                {user ? "Report Item" : "Sign In to Report"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-primary">66+</h3>
            <p className="text-muted-foreground">Metro Stations</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">3</h3>
            <p className="text-muted-foreground">Metro Lines</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">24/7</h3>
            <p className="text-muted-foreground">Booking Available</p>
          </div>
        </div>

        {/* Voice Assistant Section */}
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Voice Assistant</h2>
              <p className="text-muted-foreground">
                Speak to get help with metro services in your preferred language
              </p>
            </div>
            <div className="flex justify-center">
              <VoiceAssistant />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;

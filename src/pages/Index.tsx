import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Train, MapPin, CreditCard, Wallet, Route, User, LogOut, UtensilsCrossed, Clock, Heart, MessageSquare, Search, Mic, Car, QrCode } from "lucide-react";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Dashboard Card for authenticated users */}
          {user && (
            <Card className="feature-card bg-gradient-primary text-primary-foreground border-0" onClick={() => navigate("/dashboard")}>
              <CardHeader>
                <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Dashboard</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  View your trips, bookings, and account overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="secondary" className="w-full">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          )}
          <Card className="feature-card cursor-pointer group" onClick={() => navigate(user ? "/booking" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-smooth">
                <Train className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="group-hover:text-primary transition-smooth">Book Tickets</CardTitle>
              <CardDescription>
                Select stations, choose travel time, and book your metro tickets instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-gradient-primary hover:shadow-glow transition-smooth">
                {user ? "Book Now" : "Sign In to Book"}
              </Button>
            </CardContent>
          </Card>

          <Card className="feature-card cursor-pointer group" onClick={() => navigate(user ? "/smart-parking" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-smooth">
                <Car className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="group-hover:text-primary transition-smooth">Smart Parking</CardTitle>
              <CardDescription>
                Book parking slots at metro stations with real-time availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth">
                {user ? "Book Parking" : "Sign In to Book"}
              </Button>
            </CardContent>
          </Card>

          <Card className="feature-card cursor-pointer group" onClick={() => navigate(user ? "/smart-card" : "/auth")}>
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-smooth">
                <CreditCard className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="group-hover:text-primary transition-smooth">Smart Card</CardTitle>
              <CardDescription>
                Check balance and recharge your metro smart card digitally
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth">
                {user ? "Manage Card" : "Sign In to Access"}
              </Button>
            </CardContent>
          </Card>

          {/* Continue with remaining feature cards using same beautiful pattern */}
          {[
            { path: "/virtual-card", icon: Wallet, title: "Virtual E-Card", desc: "Create a digital contactless metro card with QR code for seamless travel", color: "orange" },
            { path: "/route-optimizer", icon: Route, title: "Route Optimizer", desc: "Find the shortest path between stations using smart algorithms", color: "red" },
            { path: "/metro-arrivals", icon: Clock, title: "Live Arrivals", desc: "Real-time metro arrival notifications with delay status and ETAs", color: "indigo" },
            { path: "/food-stalls", icon: UtensilsCrossed, title: "Food Stalls", desc: "Order delicious food from stalls at metro stations with UPI payments", color: "pink" },
            { path: "/accessibility-assistance", icon: Heart, title: "Accessibility", desc: "Request assistance for specially-abled passengers at metro stations", color: "teal" },
            { path: "/feedback", icon: MessageSquare, title: "Feedback", desc: "Share your experience and suggestions for metro services", color: "violet" },
            { path: "/lost-and-found", icon: Search, title: "Lost & Found", desc: "Report lost items or find belongings with smart matching", color: "amber" },
            { path: "/offline-tickets", icon: QrCode, title: "Offline Tickets", desc: "Generate QR tickets that work without internet connection", color: "emerald" },
            { path: "/volunteer-signup", icon: User, title: "Volunteer", desc: "Join our volunteer program to help fellow passengers", color: "cyan" },
            { path: "/voice-assistant", icon: Mic, title: "Voice Assistant", desc: "Talk to our AI assistant for hands-free metro help", color: "rose" }
          ].map((feature, index) => (
            <Card key={index} className="feature-card cursor-pointer group" onClick={() => navigate(user ? feature.path : "/auth")}>
              <CardHeader>
                <div className={`h-12 w-12 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 rounded-lg flex items-center justify-center mb-4 group-hover:shadow-glow transition-smooth`}>
                  <feature.icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                </div>
                <CardTitle className="group-hover:text-primary transition-smooth">{feature.title}</CardTitle>
                <CardDescription>{feature.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full hover:bg-primary hover:text-primary-foreground transition-smooth">
                  {user ? "Access Feature" : "Sign In to Access"}
                </Button>
              </CardContent>
            </Card>
          ))}
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

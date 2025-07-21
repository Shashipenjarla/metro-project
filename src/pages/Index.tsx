import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Train, MapPin, CreditCard, User, LogOut } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
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

          <Card className="hover:shadow-lg transition-shadow">
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
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
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
      </main>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DashboardGrid from "@/components/DashboardGrid";
import FloatingChat from "@/components/FloatingChat";
import ModalBookTicket from "@/components/ModalBookTicket";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Header user={user} />
      
      <main>
        <Hero user={user} />
        
        <DashboardGrid user={user} />

        {/* Voice Assistant Section */}
        <section className="bg-neutral-100 py-16 dark:bg-neutral-900">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Voice Assistant
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                Speak to get help with metro services in your preferred language
              </p>
            </div>
            <div className="flex justify-center">
              <VoiceAssistant />
            </div>
          </div>
        </section>

        {/* Quick Booking CTA */}
        <section className="bg-gradient-to-r from-metro-blue/10 via-metro-red/10 to-metro-green/10 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 font-display text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              Ready to Travel?
            </h2>
            <p className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
              Book your metro ticket in seconds
            </p>
            <ModalBookTicket user={user}>
              <Button size="lg" className="bg-gradient-metro-blue hover:shadow-glow-blue focus-ring shimmer">
                Quick Book Ticket
              </Button>
            </ModalBookTicket>
          </div>
        </section>
      </main>

      <FloatingChat />
    </div>
  );
};

export default Index;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { featureFlags } from "@/config/featureFlags";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import SmartCard from "./pages/SmartCard";
import VirtualCard from "./pages/VirtualCard";
import RouteOptimizer from "./pages/RouteOptimizer";
import MetroArrivals from "./pages/MetroArrivals";
import AccessibilityAssistance from "./pages/AccessibilityAssistance";
import AccessibilityRequests from "./pages/AccessibilityRequests";
import VolunteerSignup from "./pages/VolunteerSignup";
import FoodStalls from "./pages/FoodStalls";
import Feedback from "./pages/Feedback";
import FeedbackStatus from "./pages/FeedbackStatus";
import FeedbackAdmin from "./pages/FeedbackAdmin";
import LostAndFound from "./pages/LostAndFound";
import SmartParking from "./pages/SmartParking";
import MetroMap from "./pages/MetroMap";
import IndoorNavigation from "./pages/IndoorNavigation";
import OfflineTickets from "./pages/OfflineTickets";
import PostStationTransport from "./pages/PostStationTransport";
import Wallet from "./pages/Wallet";
import NotFound from "./pages/NotFound";
import FloatingChat from "./components/FloatingChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="/smart-card" element={<SmartCard />} />
          <Route path="/virtual-card" element={<VirtualCard />} />
          <Route path="/route-optimizer" element={<RouteOptimizer />} />
          <Route 
            path="/metro-arrivals" 
            element={featureFlags.liveArrivals ? <MetroArrivals /> : <Navigate to="/" replace />} 
          />
          <Route path="/accessibility-assistance" element={<AccessibilityAssistance />} />
          <Route path="/accessibility-requests" element={<AccessibilityRequests />} />
          <Route path="/volunteer-signup" element={<VolunteerSignup />} />
          <Route 
            path="/lost-and-found" 
            element={featureFlags.lostAndFound ? <LostAndFound /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/food-stalls" 
            element={featureFlags.foodStalls ? <FoodStalls /> : <Navigate to="/" replace />} 
          />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/feedback-status" element={<FeedbackStatus />} />
          <Route path="/feedback-admin" element={<FeedbackAdmin />} />
          <Route path="/smart-parking" element={<SmartParking />} />
          <Route path="/metro-map" element={<MetroMap />} />
          <Route 
            path="/indoor-navigation" 
            element={featureFlags.indoorNavigation ? <IndoorNavigation /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/offline-tickets" 
            element={featureFlags.offlineTickets ? <OfflineTickets /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/post-station-transport" 
            element={featureFlags.postStationTransport ? <PostStationTransport /> : <Navigate to="/" replace />} 
          />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <FloatingChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Clock, Sparkles, Zap } from "lucide-react";

interface TimeSavedNotificationProps {
  timeSaved: number;
  credits: number;
  onClose: () => void;
}

export function TimeSavedNotification({ 
  timeSaved, 
  credits, 
  onClose 
}: TimeSavedNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto dismiss after 5 seconds
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible && !isExiting 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 -translate-y-4'
      }`}
    >
      <Card className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 shadow-2xl border-0 min-w-[300px]">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping" />
            <div className="relative p-3 bg-white/20 rounded-full">
              <Sparkles className="h-6 w-6" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-bold text-lg">You saved {timeSaved} minutes today 🚀</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-green-100">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">
                +{credits} Time Credits added to your Time Wallet
              </span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Wallet, History, Plus, ArrowLeft } from "lucide-react";

// Mock smart card data
const SMART_CARDS = {
  "1234567890": { balance: 245, lastUsed: "2024-01-20", status: "active" },
  "0987654321": { balance: 89, lastUsed: "2024-01-19", status: "active" },
  "1122334455": { balance: 500, lastUsed: "2024-01-21", status: "active" },
};

interface RechargeRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  status: string;
}

const SmartCard = () => {
  const [user, setUser] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardData, setCardData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [showRecharge, setShowRecharge] = useState(false);
  const [rechargeHistory, setRechargeHistory] = useState<RechargeRecord[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadRechargeHistory();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadRechargeHistory = () => {
    // Mock recharge history
    const mockHistory: RechargeRecord[] = [
      { id: "1", amount: 100, date: "2024-01-20", method: "UPI", status: "completed" },
      { id: "2", amount: 50, date: "2024-01-18", method: "UPI", status: "completed" },
      { id: "3", amount: 200, date: "2024-01-15", method: "UPI", status: "completed" },
    ];
    setRechargeHistory(mockHistory);
  };

  const handleCardVerification = async () => {
    if (!cardNumber || cardNumber.length !== 10) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid 10-digit card number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const card = SMART_CARDS[cardNumber as keyof typeof SMART_CARDS];
      
      if (card) {
        setCardData({ ...card, cardNumber });
        toast({
          title: "Card Verified",
          description: "Your smart card has been successfully verified",
        });
      } else {
        toast({
          title: "Card Not Found",
          description: "The card number you entered is not registered",
          variant: "destructive",
        });
      }
      setLoading(false);
    }, 1500);
  };

  const handleRecharge = async () => {
    const amount = parseInt(rechargeAmount);
    if (!amount || amount < 10 || amount > 2000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between ₹10 and ₹2000",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate UPI payment process
    setTimeout(() => {
      const newBalance = cardData.balance + amount;
      setCardData({ ...cardData, balance: newBalance });
      
      // Add to recharge history
      const newRecord: RechargeRecord = {
        id: Date.now().toString(),
        amount,
        date: new Date().toISOString().split('T')[0],
        method: "UPI",
        status: "completed"
      };
      setRechargeHistory([newRecord, ...rechargeHistory]);
      
      toast({
        title: "Recharge Successful",
        description: `₹${amount} has been added to your card. New balance: ₹${newBalance}`,
      });
      
      setShowRecharge(false);
      setRechargeAmount("");
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Button 
          variant="outline" 
          onClick={() => navigate("/")} 
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Card Input */}
        {!cardData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Enter Smart Card Details
              </CardTitle>
              <CardDescription>
                Enter your 10-digit metro smart card number to check balance and recharge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  placeholder="Enter 10-digit card number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">
                  Try: 1234567890, 0987654321, or 1122334455
                </p>
              </div>
              <Button 
                onClick={handleCardVerification} 
                disabled={loading || cardNumber.length !== 10}
                className="w-full"
              >
                {loading ? "Verifying..." : "Verify Card"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Card Details */}
        {cardData && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Smart Card Balance
                  </div>
                  <Badge variant="secondary">{cardData.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Card Number</p>
                  <p className="font-mono text-lg">{cardData.cardNumber}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-3xl font-bold text-primary">₹{cardData.balance}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Last Used</p>
                  <p className="text-sm">{new Date(cardData.lastUsed).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setShowRecharge(true)} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Recharge
                  </Button>
                  <Button variant="outline" onClick={() => setCardData(null)} className="flex-1">
                    Change Card
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recharge Section */}
            {showRecharge && (
              <Card>
                <CardHeader>
                  <CardTitle>Recharge Your Card</CardTitle>
                  <CardDescription>Add money to your metro card using UPI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Amount</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[50, 100, 200, 500, 1000].map((amount) => (
                        <Button
                          key={amount}
                          variant={rechargeAmount === amount.toString() ? "default" : "outline"}
                          onClick={() => setRechargeAmount(amount.toString())}
                          size="sm"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Or Enter Custom Amount</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount (₹10 - ₹2000)"
                      value={rechargeAmount}
                      onChange={(e) => setRechargeAmount(e.target.value)}
                      min="10"
                      max="2000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleRecharge} disabled={loading} className="flex-1">
                      {loading ? "Processing..." : `Pay ₹${rechargeAmount || 0} via UPI`}
                    </Button>
                    <Button variant="outline" onClick={() => setShowRecharge(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recharge History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Recharge History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {rechargeHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recharge history found</p>
                ) : (
                  <div className="space-y-3">
                    {rechargeHistory.map((record) => (
                      <div key={record.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">₹{record.amount}</p>
                          <p className="text-sm text-muted-foreground">{record.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{new Date(record.date).toLocaleDateString()}</p>
                          <Badge variant="secondary" className="text-xs">
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartCard;
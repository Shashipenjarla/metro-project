import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Plus, ArrowLeft, QrCode, Wallet, History, User, Camera } from "lucide-react";
import QRCode from "qrcode";

interface VirtualCardData {
  id: string;
  card_number: string;
  holder_name: string;
  balance: number;
  status: string;
  profile_image_url?: string;
  created_at: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  payment_method: string;
  status: string;
  created_at: string;
}

const VirtualCard = () => {
  const [user, setUser] = useState<any>(null);
  const [virtualCard, setVirtualCard] = useState<VirtualCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showTopUp, setShowTopUp] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [holderName, setHolderName] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      loadVirtualCard();
      loadTransactions();
    }
  }, [user]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
  };

  const loadVirtualCard = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading virtual card:', error);
      return;
    }

    if (data) {
      setVirtualCard(data);
      generateQRCode(data);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('virtual_card_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading transactions:', error);
      return;
    }

    setTransactions(data || []);
  };

  const generateQRCode = async (cardData: VirtualCardData) => {
    try {
      const qrData = JSON.stringify({
        type: 'metro_virtual_card',
        card_number: cardData.card_number,
        holder_name: cardData.holder_name,
        balance: cardData.balance,
        issued_at: cardData.created_at
      });
      
      const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const generateCardNumber = () => {
    return 'VC' + Date.now().toString().slice(-8);
  };

  const handleCreateCard = async () => {
    if (!holderName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter your full name to create the virtual card",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const cardNumber = generateCardNumber();
      
      const { data, error } = await supabase
        .from('virtual_cards')
        .insert([
          {
            user_id: user.id,
            card_number: cardNumber,
            holder_name: holderName.trim(),
            balance: 0,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setVirtualCard(data);
      generateQRCode(data);
      setShowCreateCard(false);
      setHolderName("");
      
      toast({
        title: "Virtual Card Created!",
        description: "Your Metro E-Card has been successfully created",
      });
    } catch (error) {
      console.error('Error creating virtual card:', error);
      toast({
        title: "Error",
        description: "Failed to create virtual card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 10 || amount > 5000) {
      toast({
        title: "Invalid Amount",
        description: "Please enter an amount between ₹10 and ₹5000",
        variant: "destructive",
      });
      return;
    }

    if (!virtualCard) return;

    setLoading(true);

    try {
      // Simulate UPI payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newBalance = virtualCard.balance + (amount * 100); // Convert to paise
      
      // Update card balance
      const { error: updateError } = await supabase
        .from('virtual_cards')
        .update({ balance: newBalance })
        .eq('id', virtualCard.id);

      if (updateError) throw updateError;

      // Add transaction record
      const { error: transactionError } = await supabase
        .from('virtual_card_transactions')
        .insert([
          {
            card_id: virtualCard.id,
            user_id: user.id,
            amount: amount * 100,
            transaction_type: 'topup',
            description: `UPI Top-up of ₹${amount}`,
            payment_method: 'UPI',
            status: 'completed'
          }
        ]);

      if (transactionError) throw transactionError;

      // Update local state
      setVirtualCard({ ...virtualCard, balance: newBalance });
      loadTransactions();
      
      toast({
        title: "Top-up Successful",
        description: `₹${amount} has been added to your virtual card`,
      });
      
      setShowTopUp(false);
      setTopUpAmount("");
    } catch (error) {
      console.error('Error during top-up:', error);
      toast({
        title: "Top-up Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

        {/* Create Virtual Card */}
        {!virtualCard && !showCreateCard && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <CreditCard className="h-5 w-5" />
                Create Virtual Metro E-Card
              </CardTitle>
              <CardDescription>
                Generate a digital contactless metro card for seamless travel
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button onClick={() => setShowCreateCard(true)} size="lg" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create My E-Card
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Card Form */}
        {showCreateCard && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Create Your Virtual Card
              </CardTitle>
              <CardDescription>
                Enter your details to generate your personalized Metro E-Card
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="holder-name">Cardholder Name</Label>
                <Input
                  id="holder-name"
                  placeholder="Enter your full name"
                  value={holderName}
                  onChange={(e) => setHolderName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleCreateCard} 
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Creating..." : "Create E-Card"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateCard(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Virtual Card Display */}
        {virtualCard && (
          <>
            {/* Card Details */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-foreground opacity-10" />
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Metro E-Card
                  </div>
                  <Badge variant="secondary">{virtualCard.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Visual */}
                <div className="bg-gradient-to-r from-primary to-primary-foreground p-6 rounded-lg text-white relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-80">Metro Virtual Card</p>
                      <p className="font-mono text-lg font-bold">{virtualCard.card_number}</p>
                    </div>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={virtualCard.profile_image_url} />
                      <AvatarFallback className="bg-white/20">
                        {virtualCard.holder_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm opacity-80">Balance</p>
                      <p className="text-2xl font-bold">₹{(virtualCard.balance / 100).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-80">Cardholder</p>
                      <p className="font-medium">{virtualCard.holder_name}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                {qrCodeUrl && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Scan for contactless payment</p>
                    <div className="inline-block p-4 border rounded-lg bg-white">
                      <img src={qrCodeUrl} alt="Virtual Card QR Code" className="w-32 h-32" />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={() => setShowTopUp(true)} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Top-up
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Top-up Section */}
            {showTopUp && (
              <Card>
                <CardHeader>
                  <CardTitle>Top-up Your E-Card</CardTitle>
                  <CardDescription>Add money to your virtual metro card using UPI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Amount</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[100, 200, 500, 1000, 2000].map((amount) => (
                        <Button
                          key={amount}
                          variant={topUpAmount === amount.toString() ? "default" : "outline"}
                          onClick={() => setTopUpAmount(amount.toString())}
                          size="sm"
                        >
                          ₹{amount}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-amount">Custom Amount</Label>
                    <Input
                      id="custom-amount"
                      type="number"
                      placeholder="Enter amount (₹10 - ₹5000)"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                      min="10"
                      max="5000"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleTopUp} disabled={loading} className="flex-1">
                      {loading ? "Processing..." : `Pay ₹${topUpAmount || 0} via UPI`}
                    </Button>
                    <Button variant="outline" onClick={() => setShowTopUp(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Transaction History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No transactions found</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            transaction.transaction_type === 'topup' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Wallet className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium">₹{(transaction.amount / 100).toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">{transaction.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{new Date(transaction.created_at).toLocaleDateString()}</p>
                          <Badge variant="secondary" className="text-xs">
                            {transaction.status}
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

export default VirtualCard;
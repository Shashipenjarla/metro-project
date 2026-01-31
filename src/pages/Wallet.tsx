import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Clock } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import WalletCard from "@/components/wallet/WalletCard";
import AddMoney from "@/components/wallet/AddMoney";
import WalletTransactionList from "@/components/wallet/WalletTransactionList";
import { TimeWalletCard } from "@/components/wallet/TimeWalletCard";
import { useWallet } from "@/hooks/useWallet";

const WalletPage = () => {
  const navigate = useNavigate();
  const { balance, transactions, loading, addMoney, isAuthenticated } = useWallet();
  const [activeTab, setActiveTab] = useState("money");

  if (!isAuthenticated) {
    return (
      <PageLayout title="Metro Wallet" subtitle="Your digital metro balance" showBackButton={true}>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your Metro Wallet
          </p>
          <Button onClick={() => navigate("/auth")} className="bg-metro-blue hover:bg-metro-blue/90">
            Sign In
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Metro Wallet" subtitle="Manage your wallet balance and time credits" showBackButton={true}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md mx-auto">
          <TabsTrigger value="money" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Money Wallet
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Wallet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="money">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-6">
              <WalletCard balance={balance} loading={loading} />
              <AddMoney onAddMoney={addMoney} loading={loading} />
            </div>

            {/* Right Column */}
            <div>
              <WalletTransactionList transactions={transactions} loading={loading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="time">
          <div className="max-w-2xl mx-auto">
            <TimeWalletCard />
          </div>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default WalletPage;

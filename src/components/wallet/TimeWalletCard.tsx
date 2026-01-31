import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  Zap, 
  Trophy, 
  TrendingUp, 
  Sparkles,
  Car,
  Train,
  Crown,
  Gift
} from "lucide-react";
import { useTimeWallet, TimeCredit } from "@/hooks/useTimeWallet";

const statusColors = {
  newcomer: 'from-slate-500 to-slate-600',
  smart_commuter: 'from-blue-500 to-blue-600',
  traffic_saver: 'from-purple-500 to-purple-600',
  urban_mobility_pro: 'from-amber-500 to-amber-600',
};

const statusIcons = {
  newcomer: Clock,
  smart_commuter: Zap,
  traffic_saver: TrendingUp,
  urban_mobility_pro: Crown,
};

const rewardIcons: Record<string, React.ElementType> = {
  parking: Car,
  train: Train,
  zap: Zap,
  crown: Crown,
};

export function TimeWalletCard() {
  const { 
    totalCredits, 
    totalTimeSaved, 
    monthlyTimeSaved, 
    history, 
    status, 
    rewards 
  } = useTimeWallet();

  const StatusIcon = statusIcons[status.level];

  return (
    <div className="space-y-6">
      {/* Main Time Wallet Card */}
      <Card className={`overflow-hidden relative bg-gradient-to-br ${statusColors[status.level]} text-white`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <CardHeader className="relative z-10 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white/90">
              <Clock className="h-5 w-5" />
              Time Wallet
            </CardTitle>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.title}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-bold tracking-tight">{totalCredits}</span>
            <span className="text-white/70 text-lg mb-1">credits</span>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-xs">Total Time Saved</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <Sparkles className="h-4 w-4" />
                {totalTimeSaved} min
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-white/70 text-xs">This Month</p>
              <p className="text-xl font-semibold flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {monthlyTimeSaved} min
              </p>
            </div>
          </div>

          {/* Progress to next level */}
          {status.nextLevel && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-white/70 mb-1">
                <span>Progress to {status.nextLevel}</span>
                <span>{status.creditsToNextLevel} credits needed</span>
              </div>
              <Progress 
                value={100 - (status.creditsToNextLevel / (status.level === 'newcomer' ? 50 : status.level === 'smart_commuter' ? 150 : 300) * 100)} 
                className="h-2 bg-white/20"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gift className="h-5 w-5 text-primary" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {rewards.map((reward) => {
              const Icon = rewardIcons[reward.icon] || Trophy;
              return (
                <div
                  key={reward.id}
                  className={`p-3 rounded-lg border transition-all ${
                    reward.unlocked
                      ? 'bg-primary/10 border-primary/30 shadow-sm'
                      : 'bg-muted/50 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className={`p-2 rounded-full ${
                      reward.unlocked ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        reward.unlocked ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${
                        reward.unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {reward.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reward.description}
                      </p>
                      {!reward.unlocked && (
                        <div className="mt-2">
                          <Progress value={reward.progress} className="h-1" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {reward.requiredCredits} credits needed
                          </p>
                        </div>
                      )}
                      {reward.unlocked && (
                        <Badge className="mt-1 bg-green-500/20 text-green-600 text-xs">
                          Unlocked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Time Savings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="h-5 w-5 text-primary" />
            Recent Time Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No time savings yet</p>
              <p className="text-xs">Choose smart routes to earn credits!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((credit) => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-500/20">
                      <Zap className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{credit.route}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(credit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{credit.credits}</p>
                    <p className="text-xs text-muted-foreground">
                      {credit.timeSaved} min saved
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gamification Status Levels */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Status Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { level: 'newcomer', title: 'Newcomer', credits: 0, icon: Clock },
              { level: 'smart_commuter', title: 'Smart Commuter', credits: 50, icon: Zap },
              { level: 'traffic_saver', title: 'Traffic Saver', credits: 200, icon: TrendingUp },
              { level: 'urban_mobility_pro', title: 'Urban Mobility Pro', credits: 500, icon: Crown },
            ].map((lvl) => {
              const isActive = status.level === lvl.level;
              const isUnlocked = totalCredits >= lvl.credits;
              const Icon = lvl.icon;
              
              return (
                <div
                  key={lvl.level}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${statusColors[lvl.level as keyof typeof statusColors]} text-white border-transparent`
                      : isUnlocked
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-muted/30 border-border opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isActive ? 'bg-white/20' : isUnlocked ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isActive ? 'text-white' : isUnlocked ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      isActive ? 'text-white' : ''
                    }`}>
                      {lvl.title}
                    </p>
                    <p className={`text-xs ${
                      isActive ? 'text-white/70' : 'text-muted-foreground'
                    }`}>
                      {lvl.credits}+ credits
                    </p>
                  </div>
                  {isActive && (
                    <Badge className="bg-white/20 text-white border-0">
                      Current
                    </Badge>
                  )}
                  {isUnlocked && !isActive && (
                    <Badge variant="outline" className="text-xs">
                      Achieved
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

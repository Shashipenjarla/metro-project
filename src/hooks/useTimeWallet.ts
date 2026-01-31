import { useState, useEffect, useCallback } from 'react';

export interface TimeCredit {
  id: string;
  date: string;
  timeSaved: number; // in minutes
  credits: number;
  route: string;
  description: string;
}

export interface TimeWalletStatus {
  level: 'newcomer' | 'smart_commuter' | 'traffic_saver' | 'urban_mobility_pro';
  title: string;
  nextLevel: string | null;
  creditsToNextLevel: number;
}

const STORAGE_KEY = 'metro_time_wallet';

interface TimeWalletState {
  totalCredits: number;
  totalTimeSaved: number; // in minutes
  monthlyTimeSaved: number;
  history: TimeCredit[];
  rewards: string[];
}

const getInitialState = (): TimeWalletState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading time wallet:', e);
  }
  return {
    totalCredits: 0,
    totalTimeSaved: 0,
    monthlyTimeSaved: 0,
    history: [],
    rewards: [],
  };
};

const saveState = (state: TimeWalletState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving time wallet:', e);
  }
};

export const useTimeWallet = () => {
  const [state, setState] = useState<TimeWalletState>(getInitialState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const getStatus = useCallback((): TimeWalletStatus => {
    const { totalCredits } = state;
    
    if (totalCredits >= 500) {
      return {
        level: 'urban_mobility_pro',
        title: 'Urban Mobility Pro',
        nextLevel: null,
        creditsToNextLevel: 0,
      };
    } else if (totalCredits >= 200) {
      return {
        level: 'traffic_saver',
        title: 'Traffic Saver',
        nextLevel: 'Urban Mobility Pro',
        creditsToNextLevel: 500 - totalCredits,
      };
    } else if (totalCredits >= 50) {
      return {
        level: 'smart_commuter',
        title: 'Smart Commuter',
        nextLevel: 'Traffic Saver',
        creditsToNextLevel: 200 - totalCredits,
      };
    }
    return {
      level: 'newcomer',
      title: 'Newcomer',
      nextLevel: 'Smart Commuter',
      creditsToNextLevel: 50 - totalCredits,
    };
  }, [state.totalCredits]);

  const addTimeCredits = useCallback((
    timeSaved: number,
    route: string,
    description?: string
  ) => {
    const credits = Math.round(timeSaved); // 1 minute = 1 credit
    const newCredit: TimeCredit = {
      id: `tc_${Date.now()}`,
      date: new Date().toISOString(),
      timeSaved,
      credits,
      route,
      description: description || `Saved ${timeSaved} minutes on ${route}`,
    };

    setState(prev => {
      const newState = {
        ...prev,
        totalCredits: prev.totalCredits + credits,
        totalTimeSaved: prev.totalTimeSaved + timeSaved,
        monthlyTimeSaved: prev.monthlyTimeSaved + timeSaved,
        history: [newCredit, ...prev.history].slice(0, 50), // Keep last 50
      };

      // Check for reward unlocks
      const newRewards = [...prev.rewards];
      if (newState.totalCredits >= 50 && !prev.rewards.includes('free_parking_1')) {
        newRewards.push('free_parking_1');
      }
      if (newState.totalCredits >= 100 && !prev.rewards.includes('free_ride_1')) {
        newRewards.push('free_ride_1');
      }
      if (newState.totalCredits >= 200 && !prev.rewards.includes('priority_guidance')) {
        newRewards.push('priority_guidance');
      }
      newState.rewards = newRewards;

      return newState;
    });

    return credits;
  }, []);

  const getRewards = useCallback(() => {
    const allRewards = [
      {
        id: 'free_parking_1',
        name: 'Free Parking Session',
        description: 'One complimentary metro parking',
        requiredCredits: 50,
        icon: 'parking',
      },
      {
        id: 'free_ride_1',
        name: 'Free Metro Ride',
        description: 'One complimentary metro journey',
        requiredCredits: 100,
        icon: 'train',
      },
      {
        id: 'priority_guidance',
        name: 'Peak Hour Priority',
        description: 'Priority route guidance during rush hours',
        requiredCredits: 200,
        icon: 'zap',
      },
      {
        id: 'premium_support',
        name: 'Premium Commuter Status',
        description: 'Exclusive commuter benefits',
        requiredCredits: 500,
        icon: 'crown',
      },
    ];

    return allRewards.map(reward => ({
      ...reward,
      unlocked: state.rewards.includes(reward.id) || state.totalCredits >= reward.requiredCredits,
      progress: Math.min(100, (state.totalCredits / reward.requiredCredits) * 100),
    }));
  }, [state.rewards, state.totalCredits]);

  return {
    totalCredits: state.totalCredits,
    totalTimeSaved: state.totalTimeSaved,
    monthlyTimeSaved: state.monthlyTimeSaved,
    history: state.history,
    status: getStatus(),
    rewards: getRewards(),
    addTimeCredits,
  };
};

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (player: any) => boolean;
  reward: {
    money?: number;
    respect?: number;
  };
  unlocked: boolean;
}

export interface CityEvent {
  id: string;
  title: string;
  description: string;
  effect: string;
  icon: string;
  duration: number; // em segundos
  modifier: {
    crimeSuccess?: number;
    crimeReward?: number;
    drugPrice?: number;
  };
}

export interface DailyMission {
  id: string;
  name: string;
  description: string;
  requirement: {
    type: "crimes" | "money" | "respect" | "training";
    target: number;
  };
  progress: number;
  reward: {
    money: number;
    respect: number;
  };
  completed: boolean;
}

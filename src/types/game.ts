export interface PlayerStats {
  strength: number;
  intelligence: number;
  charisma: number;
  tolerance: number;
}

export type Profession = "thug" | "hacker" | "dealer" | "conman" | "enforcer";

export interface Player {
  name: string;
  level: number;
  respect: number;
  money: number;
  bankMoney: number;
  health: number;
  maxHealth: number;
  energy: number;
  maxEnergy: number;
  stats: PlayerStats;
  weapons: Weapon[];
  drugs: Drug[];
  profession: Profession | null;
  inPrison: boolean;
  prisonTime: number;
  crimes: number;
  successfulCrimes: number;
  businesses: string[];
}

export interface Crime {
  id: string;
  name: string;
  difficulty: number;
  reward: number;
  respect: number;
  energyCost: number;
  requiredLevel: number;
  successChance: number;
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  price: number;
}

export interface Drug {
  id: string;
  name: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
}

export interface DrugOrder {
  id: string;
  drugId: string;
  type: "buy" | "sell";
  orderType: "market" | "limit";
  quantity: number;
  price?: number;
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface DrugOrderBook {
  drugId: string;
  buyOrders: DrugOrder[];
  sellOrders: DrugOrder[];
}

export interface CityLot {
  id: string;
  x: number;
  y: number;
  district: "downtown" | "industrial" | "suburbs" | "port" | "slums";
  basePrice: number;
  modifier: number;
  ownerId: string | null;
  businessId: string | null;
}

export interface BusinessEmployee {
  id: string;
  name: string;
  type: "security" | "manager" | "dealer" | "promoter";
  skill: number;
  salary: number;
}

export interface BusinessEvent {
  id: string;
  type: "raid" | "vip_client" | "competition" | "renovation" | "trouble";
  title: string;
  description: string;
  effect: {
    popularity?: number;
    income?: number;
    duration?: number;
  };
  timestamp: number;
}

export interface Business {
  id: string;
  name: string;
  type: "nightclub" | "casino" | "druglab" | "chop_shop" | "brothel";
  ownerId: string;
  ownerName: string;
  lotId: string;
  level: number;
  income: number;
  popularity: number;
  lastCollection: number;
  employees: BusinessEmployee[];
  activeEvent: BusinessEvent | null;
  accumulatedIncome: number;
  security: number;
  quality: number;
}

export interface GameState {
  player: Player;
  lastUpdate: number;
  drugOrders: DrugOrder[];
  cityLots: CityLot[];
  businesses: Business[];
}

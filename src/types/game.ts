export interface PlayerStats {
  strength: number;
  intelligence: number;
  charisma: number;
  tolerance: number;
}

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
  inPrison: boolean;
  prisonTime: number;
  crimes: number;
  successfulCrimes: number;
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

export interface GameState {
  player: Player;
  lastUpdate: number;
}

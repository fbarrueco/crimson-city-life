import { Player, Crime, Weapon, Drug, GameState } from "@/types/game";

const STORAGE_KEY = "crimcity_game_state";
const ENERGY_REGEN_INTERVAL = 60000; // 1 minuto
const ENERGY_REGEN_AMOUNT = 1;

export const crimes: Crime[] = [
  {
    id: "drunk",
    name: "Assaltar Bêbado",
    difficulty: 1,
    reward: 50,
    respect: 1,
    energyCost: 5,
    requiredLevel: 1,
    successChance: 90,
  },
  {
    id: "graffiti",
    name: "Pixar Muro",
    difficulty: 1,
    reward: 30,
    respect: 1,
    energyCost: 3,
    requiredLevel: 1,
    successChance: 95,
  },
  {
    id: "car_radio",
    name: "Roubar Rádio de Carro",
    difficulty: 2,
    reward: 100,
    respect: 2,
    energyCost: 8,
    requiredLevel: 1,
    successChance: 75,
  },
  {
    id: "store",
    name: "Assaltar Loja",
    difficulty: 3,
    reward: 250,
    respect: 5,
    energyCost: 15,
    requiredLevel: 2,
    successChance: 65,
  },
  {
    id: "pharmacy",
    name: "Roubar Farmácia",
    difficulty: 4,
    reward: 500,
    respect: 10,
    energyCost: 20,
    requiredLevel: 3,
    successChance: 55,
  },
  {
    id: "jewelry",
    name: "Assaltar Joalheria",
    difficulty: 5,
    reward: 1000,
    respect: 20,
    energyCost: 30,
    requiredLevel: 5,
    successChance: 45,
  },
  {
    id: "bank",
    name: "Roubar Banco",
    difficulty: 7,
    reward: 5000,
    respect: 50,
    energyCost: 40,
    requiredLevel: 8,
    successChance: 30,
  },
];

export const weapons: Weapon[] = [
  { id: "knife", name: "Faca", damage: 5, price: 100 },
  { id: "pistol", name: "Pistola", damage: 15, price: 500 },
  { id: "shotgun", name: "Escopeta", damage: 30, price: 2000 },
  { id: "rifle", name: "Rifle", damage: 50, price: 5000 },
  { id: "ak47", name: "AK-47", damage: 80, price: 15000 },
];

export const drugTypes = [
  { id: "weed", name: "Maconha", basePrice: 10 },
  { id: "cocaine", name: "Cocaína", basePrice: 50 },
  { id: "heroin", name: "Heroína", basePrice: 100 },
  { id: "meth", name: "Metanfetamina", basePrice: 150 },
];

export const professions = [
  { id: "thug", name: "Capanga", bonus: { strength: 5 }, crimeBonus: 10 },
  { id: "hacker", name: "Hacker", bonus: { intelligence: 5 }, crimeBonus: 15 },
  { id: "dealer", name: "Traficante", bonus: { charisma: 5 }, drugBonus: 20 },
  { id: "conman", name: "Golpista", bonus: { charisma: 3, intelligence: 3 }, crimeBonus: 12 },
  { id: "enforcer", name: "Executor", bonus: { strength: 3, tolerance: 3 }, combatBonus: 15 },
];

export function createNewPlayer(name: string): Player {
  return {
    name,
    level: 1,
    respect: 0,
    money: 500,
    bankMoney: 0,
    health: 100,
    maxHealth: 100,
    energy: 100,
    maxEnergy: 100,
    stats: {
      strength: 10,
      intelligence: 10,
      charisma: 10,
      tolerance: 10,
    },
    weapons: [],
    drugs: [],
    profession: null,
    inPrison: false,
    prisonTime: 0,
    crimes: 0,
    successfulCrimes: 0,
    businesses: [],
  };
}

export function saveGameState(player: Player, drugOrders: any[] = [], cityLots: any[] = [], businesses: any[] = []): void {
  const gameState: GameState = {
    player,
    lastUpdate: Date.now(),
    drugOrders,
    cityLots,
    businesses,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
}

export function loadGameState(): GameState | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  
  try {
    return JSON.parse(saved) as GameState;
  } catch {
    return null;
  }
}

export function updateEnergyRegen(player: Player, lastUpdate: number): Player {
  const now = Date.now();
  const timePassed = now - lastUpdate;
  const energyToRegen = Math.floor(timePassed / ENERGY_REGEN_INTERVAL) * ENERGY_REGEN_AMOUNT;
  
  return {
    ...player,
    energy: Math.min(player.energy + energyToRegen, player.maxEnergy),
  };
}

export function calculateCrimeSuccess(crime: Crime, player: Player): boolean {
  const baseChance = crime.successChance;
  
  // Bonus de stats (mais equilibrado)
  const statBonus = (player.stats.intelligence + player.stats.strength) / 20;
  
  // Bonus de nível (reduzido)
  const levelBonus = player.level * 1.5;
  
  // Bonus de arma (melhor arma = mais sucesso)
  let weaponBonus = 0;
  if (player.weapons.length > 0) {
    const bestWeapon = player.weapons.reduce((a, b) => a.damage > b.damage ? a : b);
    weaponBonus = bestWeapon.damage / 10;
  }
  
  // Bonus de profissão
  let professionBonus = 0;
  if (player.profession) {
    const prof = professions.find(p => p.id === player.profession);
    if (prof?.crimeBonus) {
      professionBonus = prof.crimeBonus;
    }
  }
  
  const finalChance = Math.min(95, baseChance + statBonus + levelBonus + weaponBonus + professionBonus);
  
  return Math.random() * 100 < finalChance;
}

export function executeCrime(crime: Crime, player: Player): { player: Player; success: boolean; message: string } {
  if (player.energy < crime.energyCost) {
    return { player, success: false, message: "Energia insuficiente!" };
  }

  if (player.level < crime.requiredLevel) {
    return { player, success: false, message: "Nível insuficiente!" };
  }

  const success = calculateCrimeSuccess(crime, player);
  const updatedPlayer = { ...player };
  
  updatedPlayer.energy -= crime.energyCost;
  updatedPlayer.crimes += 1;

  if (success) {
    updatedPlayer.money += crime.reward;
    updatedPlayer.respect += crime.respect;
    updatedPlayer.successfulCrimes += 1;
    
    // Chance de subir de nível
    if (updatedPlayer.respect >= updatedPlayer.level * 100) {
      updatedPlayer.level += 1;
      updatedPlayer.maxHealth += 10;
      updatedPlayer.maxEnergy += 5;
      return {
        player: updatedPlayer,
        success: true,
        message: `Crime bem sucedido! +$${crime.reward} +${crime.respect} respeito. SUBIU DE NÍVEL!`,
      };
    }
    
    return {
      player: updatedPlayer,
      success: true,
      message: `Crime bem sucedido! Você ganhou $${crime.reward} e ${crime.respect} de respeito.`,
    };
  } else {
    // Falhou - vai preso e perde dinheiro
    const moneyLost = Math.floor(updatedPlayer.money * 0.3);
    updatedPlayer.money -= moneyLost;
    updatedPlayer.inPrison = true;
    updatedPlayer.prisonTime = crime.difficulty * 30; // segundos
    updatedPlayer.health = Math.max(20, updatedPlayer.health - 10);
    
    return {
      player: updatedPlayer,
      success: false,
      message: `Crime falhou! Você foi preso e perdeu $${moneyLost}. Prisão: ${updatedPlayer.prisonTime}s`,
    };
  }
}

export function buyWeapon(weapon: Weapon, player: Player): { player: Player; success: boolean; message: string } {
  if (player.money < weapon.price) {
    return { player, success: false, message: "Dinheiro insuficiente!" };
  }

  if (player.weapons.find(w => w.id === weapon.id)) {
    return { player, success: false, message: "Você já possui esta arma!" };
  }

  const updatedPlayer = {
    ...player,
    money: player.money - weapon.price,
    weapons: [...player.weapons, weapon],
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você comprou ${weapon.name} por $${weapon.price}!`,
  };
}

export function buyDrug(drugId: string, quantity: number, player: Player): { player: Player; success: boolean; message: string } {
  const drugType = drugTypes.find(d => d.id === drugId);
  if (!drugType) {
    return { player, success: false, message: "Droga inválida!" };
  }

  const price = drugType.basePrice * (0.8 + Math.random() * 0.4); // Preço varia
  const totalCost = Math.floor(price * quantity);

  if (player.money < totalCost) {
    return { player, success: false, message: "Dinheiro insuficiente!" };
  }

  const existingDrug = player.drugs.find(d => d.id === drugId);
  const updatedDrugs = existingDrug
    ? player.drugs.map(d => d.id === drugId ? { ...d, quantity: d.quantity + quantity, buyPrice: price } : d)
    : [...player.drugs, { id: drugId, name: drugType.name, quantity, buyPrice: price, sellPrice: 0 }];

  const updatedPlayer = {
    ...player,
    money: player.money - totalCost,
    drugs: updatedDrugs,
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você comprou ${quantity}g de ${drugType.name} por $${totalCost}!`,
  };
}

export function sellDrug(drugId: string, quantity: number, player: Player): { player: Player; success: boolean; message: string } {
  const drugType = drugTypes.find(d => d.id === drugId);
  const playerDrug = player.drugs.find(d => d.id === drugId);
  
  if (!drugType || !playerDrug) {
    return { player, success: false, message: "Você não possui esta droga!" };
  }

  if (playerDrug.quantity < quantity) {
    return { player, success: false, message: "Quantidade insuficiente!" };
  }

  const sellPrice = drugType.basePrice * (1 + Math.random() * 0.6); // Vende por mais
  const totalEarned = Math.floor(sellPrice * quantity);

  const updatedDrugs = playerDrug.quantity === quantity
    ? player.drugs.filter(d => d.id !== drugId)
    : player.drugs.map(d => d.id === drugId ? { ...d, quantity: d.quantity - quantity } : d);

  const updatedPlayer = {
    ...player,
    money: player.money + totalEarned,
    drugs: updatedDrugs,
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você vendeu ${quantity}g de ${drugType.name} por $${totalEarned}!`,
  };
}

export function depositMoney(amount: number, player: Player): { player: Player; success: boolean; message: string } {
  if (amount > player.money) {
    return { player, success: false, message: "Dinheiro insuficiente!" };
  }

  const updatedPlayer = {
    ...player,
    money: player.money - amount,
    bankMoney: player.bankMoney + amount,
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você depositou $${amount} no banco.`,
  };
}

export function withdrawMoney(amount: number, player: Player): { player: Player; success: boolean; message: string } {
  if (amount > player.bankMoney) {
    return { player, success: false, message: "Saldo insuficiente!" };
  }

  const updatedPlayer = {
    ...player,
    money: player.money + amount,
    bankMoney: player.bankMoney - amount,
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você sacou $${amount} do banco.`,
  };
}

export function healPlayer(player: Player): { player: Player; success: boolean; message: string; cost: number } {
  const healthNeeded = player.maxHealth - player.health;
  if (healthNeeded === 0) {
    return { player, success: false, message: "Você já está com saúde máxima!", cost: 0 };
  }

  const cost = healthNeeded * 5; // $5 por ponto de vida
  
  if (player.money < cost) {
    return { player, success: false, message: "Dinheiro insuficiente!", cost };
  }

  const updatedPlayer = {
    ...player,
    money: player.money - cost,
    health: player.maxHealth,
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você se curou completamente por $${cost}!`,
    cost,
  };
}

export function trainStat(stat: keyof Player["stats"], player: Player): { player: Player; success: boolean; message: string } {
  const cost = (player.stats[stat] * 50);
  
  if (player.money < cost) {
    return { player, success: false, message: "Dinheiro insuficiente!" };
  }

  const updatedPlayer = {
    ...player,
    money: player.money - cost,
    stats: {
      ...player.stats,
      [stat]: player.stats[stat] + 1,
    },
  };

  const statNames = {
    strength: "Força",
    intelligence: "Inteligência",
    charisma: "Carisma",
    tolerance: "Tolerância",
  };

  return {
    player: updatedPlayer,
    success: true,
    message: `Você treinou ${statNames[stat]} por $${cost}!`,
  };
}

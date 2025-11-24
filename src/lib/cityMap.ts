import { CityLot, Business, BusinessEvent } from "@/types/game";

const GRID_SIZE = 20;

export function generateCityMap(): CityLot[] {
  const lots: CityLot[] = [];
  
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const district = getDistrict(x, y);
      const basePrice = getBasePrice(district);
      const modifier = 0.8 + Math.random() * 0.4;
      
      lots.push({
        id: `lot_${x}_${y}`,
        x,
        y,
        district,
        basePrice: Math.floor(basePrice * modifier),
        modifier,
        ownerId: null,
        businessId: null,
      });
    }
  }
  
  return lots;
}

function getDistrict(x: number, y: number): CityLot["district"] {
  const centerX = GRID_SIZE / 2;
  const centerY = GRID_SIZE / 2;
  const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  
  if (distFromCenter < 3) return "downtown";
  if (x < 5 || y < 5) return "industrial";
  if (x > 15 || y > 15) return "slums";
  if (y < 8 && x > 10) return "port";
  return "suburbs";
}

function getBasePrice(district: CityLot["district"]): number {
  switch (district) {
    case "downtown": return 50000;
    case "port": return 35000;
    case "suburbs": return 25000;
    case "industrial": return 20000;
    case "slums": return 10000;
  }
}

export const businessTypes = [
  { 
    id: "nightclub", 
    name: "Boate", 
    cost: 25000, 
    baseIncome: 500,
    upgradeCostMultiplier: 1.5,
    maxLevel: 10,
    description: "Gera renda passiva e atrai clientes"
  },
  { 
    id: "casino", 
    name: "Cassino", 
    cost: 50000, 
    baseIncome: 1000,
    upgradeCostMultiplier: 1.6,
    maxLevel: 10,
    description: "Alta renda mas requer gestão ativa"
  },
  { 
    id: "druglab", 
    name: "Laboratório", 
    cost: 40000, 
    baseIncome: 800,
    upgradeCostMultiplier: 1.5,
    maxLevel: 10,
    description: "Produz drogas para vender"
  },
  { 
    id: "chop_shop", 
    name: "Desmanche", 
    cost: 30000, 
    baseIncome: 600,
    upgradeCostMultiplier: 1.4,
    maxLevel: 10,
    description: "Processa carros roubados"
  },
  { 
    id: "brothel", 
    name: "Bordel", 
    cost: 20000, 
    baseIncome: 400,
    upgradeCostMultiplier: 1.3,
    maxLevel: 10,
    description: "Renda estável e discreta"
  },
];

export const employeeTypes = [
  { type: "security", name: "Segurança", baseSalary: 200, effect: "Aumenta segurança e reduz raids" },
  { type: "manager", name: "Gerente", baseSalary: 300, effect: "Aumenta eficiência e renda" },
  { type: "dealer", name: "Negociante", baseSalary: 250, effect: "Aumenta popularidade" },
  { type: "promoter", name: "Promotor", baseSalary: 150, effect: "Atrai mais clientes" },
];

export function calculateBusinessIncome(business: Business, lot: CityLot): number {
  const businessType = businessTypes.find(b => b.id === business.type);
  if (!businessType) return 0;
  
  const baseIncome = businessType.baseIncome * business.level;
  const districtModifier = lot.modifier;
  const popularityModifier = 1 + (business.popularity / 100);
  const qualityModifier = 1 + (business.quality / 100);
  const securityModifier = 1 + (business.security / 200);
  
  // Bônus de funcionários
  let employeeBonus = 1;
  business.employees.forEach(emp => {
    if (emp.type === "manager") employeeBonus += emp.skill / 100;
    if (emp.type === "dealer") employeeBonus += emp.skill / 200;
  });
  
  return Math.floor(baseIncome * districtModifier * popularityModifier * qualityModifier * securityModifier * employeeBonus);
}

export function getUpgradeCost(business: Business): number {
  const businessType = businessTypes.find(b => b.id === business.type);
  if (!businessType) return 0;
  
  return Math.floor(businessType.cost * Math.pow(businessType.upgradeCostMultiplier, business.level));
}

export function generateBusinessEvent(business: Business): BusinessEvent | null {
  const eventChance = Math.random();
  
  // Chance reduzida se tiver boa segurança
  const securityReduction = business.security / 200;
  
  if (eventChance < 0.05 - securityReduction) {
    // Raid policial
    return {
      id: `event_${Date.now()}`,
      type: "raid",
      title: "🚨 Operação Policial!",
      description: "A polícia está investigando seu negócio. Popularidade e renda reduzidas temporariamente.",
      effect: { popularity: -20, income: -30, duration: 300 },
      timestamp: Date.now(),
    };
  } else if (eventChance > 0.95) {
    // Cliente VIP
    const bonus = 10 + Math.floor(Math.random() * 20);
    return {
      id: `event_${Date.now()}`,
      type: "vip_client",
      title: "⭐ Cliente VIP!",
      description: "Um cliente importante visitou seu negócio. Popularidade e renda aumentadas!",
      effect: { popularity: bonus, income: bonus * 2, duration: 180 },
      timestamp: Date.now(),
    };
  } else if (eventChance > 0.90 && eventChance <= 0.95) {
    // Competição
    return {
      id: `event_${Date.now()}`,
      type: "competition",
      title: "💼 Concorrência Agressiva",
      description: "Concorrentes estão roubando seus clientes. Invista em marketing!",
      effect: { popularity: -15, duration: 240 },
      timestamp: Date.now(),
    };
  }
  
  return null;
}

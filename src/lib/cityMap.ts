import { CityLot, Business } from "@/types/game";

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
    description: "Gera renda passiva e atrai clientes"
  },
  { 
    id: "casino", 
    name: "Cassino", 
    cost: 50000, 
    baseIncome: 1000,
    description: "Alta renda mas requer gestão ativa"
  },
  { 
    id: "druglab", 
    name: "Laboratório", 
    cost: 40000, 
    baseIncome: 800,
    description: "Produz drogas para vender"
  },
  { 
    id: "chop_shop", 
    name: "Desmanche", 
    cost: 30000, 
    baseIncome: 600,
    description: "Processa carros roubados"
  },
  { 
    id: "brothel", 
    name: "Bordel", 
    cost: 20000, 
    baseIncome: 400,
    description: "Renda estável e discreta"
  },
];

export function calculateBusinessIncome(business: Business, lot: CityLot): number {
  const businessType = businessTypes.find(b => b.id === business.type);
  if (!businessType) return 0;
  
  const baseIncome = businessType.baseIncome * business.level;
  const districtModifier = lot.modifier;
  const popularityModifier = 1 + (business.popularity / 100);
  
  return Math.floor(baseIncome * districtModifier * popularityModifier);
}

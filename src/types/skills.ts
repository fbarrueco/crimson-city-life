export interface Skill {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "combat" | "business" | "stealth" | "social";
  tier: 1 | 2 | 3;
  cost: number;
  requires?: string[];
  effects: {
    crimeSuccessBonus?: number;
    crimeRewardBonus?: number;
    drugProfitBonus?: number;
    businessIncomeBonus?: number;
    energyRegenBonus?: number;
    statMultiplier?: { [key: string]: number };
    weaponDamageBonus?: number;
    prisonTimeReduction?: number;
  };
}

export const skillTree: Skill[] = [
  // COMBAT TREE - Tier 1
  {
    id: "street_fighter",
    name: "Lutador de Rua",
    description: "+10% chance de sucesso em crimes violentos",
    icon: "👊",
    category: "combat",
    tier: 1,
    cost: 1,
    effects: { crimeSuccessBonus: 10 },
  },
  {
    id: "weapon_expert",
    name: "Especialista em Armas",
    description: "+15% de dano com armas",
    icon: "🔫",
    category: "combat",
    tier: 1,
    cost: 1,
    effects: { weaponDamageBonus: 15 },
  },
  
  // COMBAT TREE - Tier 2
  {
    id: "intimidation",
    name: "Intimidação",
    description: "+20% recompensa em crimes e -25% tempo de prisão",
    icon: "😈",
    category: "combat",
    tier: 2,
    cost: 2,
    requires: ["street_fighter"],
    effects: { crimeRewardBonus: 20, prisonTimeReduction: 25 },
  },
  {
    id: "tactical_mind",
    name: "Mente Tática",
    description: "+15% sucesso em crimes e Força x1.5",
    icon: "🧠",
    category: "combat",
    tier: 2,
    cost: 2,
    requires: ["weapon_expert"],
    effects: { crimeSuccessBonus: 15, statMultiplier: { strength: 1.5 } },
  },
  
  // COMBAT TREE - Tier 3
  {
    id: "kingpin",
    name: "Chefão",
    description: "+30% sucesso, +30% recompensa em todos os crimes",
    icon: "👑",
    category: "combat",
    tier: 3,
    cost: 3,
    requires: ["intimidation", "tactical_mind"],
    effects: { crimeSuccessBonus: 30, crimeRewardBonus: 30 },
  },
  
  // BUSINESS TREE - Tier 1
  {
    id: "entrepreneur",
    name: "Empreendedor",
    description: "+20% renda dos negócios",
    icon: "💼",
    category: "business",
    tier: 1,
    cost: 1,
    effects: { businessIncomeBonus: 20 },
  },
  {
    id: "drug_chemist",
    name: "Químico",
    description: "+25% lucro vendendo drogas",
    icon: "⚗️",
    category: "business",
    tier: 1,
    cost: 1,
    effects: { drugProfitBonus: 25 },
  },
  
  // BUSINESS TREE - Tier 2
  {
    id: "money_laundering",
    name: "Lavagem de Dinheiro",
    description: "+30% renda de negócios e Carisma x1.5",
    icon: "💰",
    category: "business",
    tier: 2,
    cost: 2,
    requires: ["entrepreneur"],
    effects: { businessIncomeBonus: 30, statMultiplier: { charisma: 1.5 } },
  },
  {
    id: "cartel_connections",
    name: "Conexões do Cartel",
    description: "+40% lucro em drogas e acesso a drogas raras",
    icon: "🌐",
    category: "business",
    tier: 2,
    cost: 2,
    requires: ["drug_chemist"],
    effects: { drugProfitBonus: 40 },
  },
  
  // BUSINESS TREE - Tier 3
  {
    id: "empire_builder",
    name: "Construtor de Império",
    description: "+50% renda de negócios, +50% lucro em drogas",
    icon: "🏰",
    category: "business",
    tier: 3,
    cost: 3,
    requires: ["money_laundering", "cartel_connections"],
    effects: { businessIncomeBonus: 50, drugProfitBonus: 50 },
  },
  
  // STEALTH TREE - Tier 1
  {
    id: "lockpicking",
    name: "Arrombamento",
    description: "+15% sucesso em roubos e assaltos",
    icon: "🔓",
    category: "stealth",
    tier: 1,
    cost: 1,
    effects: { crimeSuccessBonus: 15 },
  },
  {
    id: "quick_escape",
    name: "Fuga Rápida",
    description: "-50% tempo de prisão",
    icon: "🏃",
    category: "stealth",
    tier: 1,
    cost: 1,
    effects: { prisonTimeReduction: 50 },
  },
  
  // STEALTH TREE - Tier 2
  {
    id: "master_thief",
    name: "Mestre Ladrão",
    description: "+25% sucesso em crimes e Inteligência x1.5",
    icon: "🥷",
    category: "stealth",
    tier: 2,
    cost: 2,
    requires: ["lockpicking"],
    effects: { crimeSuccessBonus: 25, statMultiplier: { intelligence: 1.5 } },
  },
  {
    id: "ghost",
    name: "Fantasma",
    description: "-75% tempo de prisão e +20% sucesso",
    icon: "👻",
    category: "stealth",
    tier: 2,
    cost: 2,
    requires: ["quick_escape"],
    effects: { prisonTimeReduction: 75, crimeSuccessBonus: 20 },
  },
  
  // STEALTH TREE - Tier 3
  {
    id: "shadow_legend",
    name: "Lenda das Sombras",
    description: "+40% sucesso, nunca pega mais de 30s de prisão",
    icon: "🌑",
    category: "stealth",
    tier: 3,
    cost: 3,
    requires: ["master_thief", "ghost"],
    effects: { crimeSuccessBonus: 40, prisonTimeReduction: 90 },
  },
  
  // SOCIAL TREE - Tier 1
  {
    id: "smooth_talker",
    name: "Lábia",
    description: "+10% recompensa em crimes e Carisma x1.3",
    icon: "💬",
    category: "social",
    tier: 1,
    cost: 1,
    effects: { crimeRewardBonus: 10, statMultiplier: { charisma: 1.3 } },
  },
  {
    id: "networker",
    name: "Networking",
    description: "+15% renda de negócios",
    icon: "🤝",
    category: "social",
    tier: 1,
    cost: 1,
    effects: { businessIncomeBonus: 15 },
  },
  
  // SOCIAL TREE - Tier 2
  {
    id: "manipulator",
    name: "Manipulador",
    description: "+25% recompensa e +15% sucesso em crimes",
    icon: "🎭",
    category: "social",
    tier: 2,
    cost: 2,
    requires: ["smooth_talker"],
    effects: { crimeRewardBonus: 25, crimeSuccessBonus: 15 },
  },
  {
    id: "influence",
    name: "Influência",
    description: "+25% renda de negócios e -30% tempo de prisão",
    icon: "⭐",
    category: "social",
    tier: 2,
    cost: 2,
    requires: ["networker"],
    effects: { businessIncomeBonus: 25, prisonTimeReduction: 30 },
  },
  
  // SOCIAL TREE - Tier 3
  {
    id: "political_power",
    name: "Poder Político",
    description: "+40% em tudo: sucesso, recompensa, renda e drogas",
    icon: "🏛️",
    category: "social",
    tier: 3,
    cost: 3,
    requires: ["manipulator", "influence"],
    effects: { 
      crimeSuccessBonus: 40, 
      crimeRewardBonus: 40, 
      businessIncomeBonus: 40,
      drugProfitBonus: 40,
    },
  },
];

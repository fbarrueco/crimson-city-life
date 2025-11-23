import { Achievement, CityEvent, DailyMission } from "@/types/achievements";
import { Player } from "@/types/game";

export const achievements: Achievement[] = [
  {
    id: "first_crime",
    name: "Primeira Vez",
    description: "Cometa seu primeiro crime",
    icon: "🎯",
    requirement: (player: Player) => player.crimes >= 1,
    reward: { money: 100, respect: 5 },
    unlocked: false,
  },
  {
    id: "ten_crimes",
    name: "Veterano",
    description: "Cometa 10 crimes com sucesso",
    icon: "⭐",
    requirement: (player: Player) => player.successfulCrimes >= 10,
    reward: { money: 500, respect: 20 },
    unlocked: false,
  },
  {
    id: "rich",
    name: "Rico",
    description: "Acumule $10.000",
    icon: "💰",
    requirement: (player: Player) => player.money + player.bankMoney >= 10000,
    reward: { money: 1000, respect: 30 },
    unlocked: false,
  },
  {
    id: "respected",
    name: "Respeitado",
    description: "Alcance 100 de respeito",
    icon: "👑",
    requirement: (player: Player) => player.respect >= 100,
    reward: { money: 2000, respect: 50 },
    unlocked: false,
  },
  {
    id: "survivor",
    name: "Sobrevivente",
    description: "Seja preso 5 vezes e sobreviva",
    icon: "🔓",
    requirement: (player: Player) => (player.crimes - player.successfulCrimes) >= 5,
    reward: { money: 1500, respect: 40 },
    unlocked: false,
  },
  {
    id: "arsenal",
    name: "Arsenal Completo",
    description: "Possua 3 armas diferentes",
    icon: "🔫",
    requirement: (player: Player) => player.weapons.length >= 3,
    reward: { money: 3000, respect: 60 },
    unlocked: false,
  },
  {
    id: "drug_lord",
    name: "Barão das Drogas",
    description: "Venda drogas no valor de $5.000",
    icon: "💊",
    requirement: (player: Player) => true, // Precisa de tracking adicional
    reward: { money: 2500, respect: 70 },
    unlocked: false,
  },
  {
    id: "level_5",
    name: "Criminoso Profissional",
    description: "Alcance o nível 5",
    icon: "🎖️",
    requirement: (player: Player) => player.level >= 5,
    reward: { money: 5000, respect: 100 },
    unlocked: false,
  },
  {
    id: "strong",
    name: "Fortão",
    description: "Tenha 50 de força",
    icon: "💪",
    requirement: (player: Player) => player.stats.strength >= 50,
    reward: { money: 3000, respect: 80 },
    unlocked: false,
  },
  {
    id: "genius",
    name: "Gênio do Crime",
    description: "Tenha 50 de inteligência",
    icon: "🧠",
    requirement: (player: Player) => player.stats.intelligence >= 50,
    reward: { money: 3000, respect: 80 },
    unlocked: false,
  },
];

export const cityEvents: CityEvent[] = [
  {
    id: "police_raid",
    title: "🚨 Operação Policial",
    description: "A polícia está fazendo uma operação na cidade!",
    effect: "Chances de sucesso em crimes reduzidas em 20%",
    icon: "🚨",
    duration: 120,
    modifier: { crimeSuccess: -20 },
  },
  {
    id: "festival",
    title: "🎉 Festival na Cidade",
    description: "A cidade está em festa!",
    effect: "Crimes rendem 50% mais dinheiro",
    icon: "🎉",
    duration: 180,
    modifier: { crimeReward: 50 },
  },
  {
    id: "drug_shortage",
    title: "💊 Escassez de Drogas",
    description: "Há uma escassez de drogas na cidade!",
    effect: "Preços de drogas aumentados em 100%",
    icon: "📈",
    duration: 150,
    modifier: { drugPrice: 100 },
  },
  {
    id: "corruption",
    title: "💸 Corrupção na Polícia",
    description: "Os policiais estão aceitando suborno!",
    effect: "Chances de sucesso aumentadas em 30%",
    icon: "💸",
    duration: 200,
    modifier: { crimeSuccess: 30 },
  },
  {
    id: "gang_war",
    title: "⚔️ Guerra de Gangues",
    description: "As ruas estão perigosas!",
    effect: "Perda de vida em prisão dobrada",
    icon: "⚔️",
    duration: 100,
    modifier: {},
  },
];

export function generateDailyMissions(): DailyMission[] {
  return [
    {
      id: "daily_crimes",
      name: "Rotina Criminal",
      description: "Cometa 5 crimes com sucesso",
      requirement: { type: "crimes", target: 5 },
      progress: 0,
      reward: { money: 1000, respect: 20 },
      completed: false,
    },
    {
      id: "daily_money",
      name: "Ganância",
      description: "Ganhe $2.000 em dinheiro",
      requirement: { type: "money", target: 2000 },
      progress: 0,
      reward: { money: 500, respect: 15 },
      completed: false,
    },
    {
      id: "daily_training",
      name: "Treino Diário",
      description: "Treine qualquer atributo 3 vezes",
      requirement: { type: "training", target: 3 },
      progress: 0,
      reward: { money: 800, respect: 10 },
      completed: false,
    },
  ];
}

export function checkAchievements(
  player: Player,
  unlockedAchievements: string[]
): { newUnlocked: Achievement[]; updatedList: string[] } {
  const newUnlocked: Achievement[] = [];
  const updatedList = [...unlockedAchievements];

  achievements.forEach((achievement) => {
    if (!updatedList.includes(achievement.id) && achievement.requirement(player)) {
      newUnlocked.push(achievement);
      updatedList.push(achievement.id);
    }
  });

  return { newUnlocked, updatedList };
}

export function getRandomEvent(): CityEvent | null {
  // 10% de chance de evento acontecer
  if (Math.random() > 0.1) return null;
  
  return cityEvents[Math.floor(Math.random() * cityEvents.length)];
}

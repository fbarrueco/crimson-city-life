import { Mission } from "@/types/game";

export const storyMissions: Mission[] = [
  {
    id: "tutorial_1",
    name: "Bem-vindo à Cidade",
    description: "Conheça Marcus, seu primeiro contato no submundo",
    storyText: "Você acabou de chegar na cidade. Marcus, um veterano do crime, se oferece para te mostrar como as coisas funcionam por aqui. 'Primeiro, você precisa provar que não é um covarde. Cometa um crime simples.'",
    npcName: "Marcus 'O Veterano'",
    npcAvatar: "👴",
    requirement: { type: "crime", target: 1, current: 0 },
    reward: { money: 200, respect: 10, skillPoints: 1 },
    unlockLevel: 1,
    nextMission: "tutorial_2",
  },
  {
    id: "tutorial_2",
    name: "Armando-se",
    description: "Marcus aconselha você a comprar sua primeira arma",
    storyText: "Marcus sorri. 'Não foi mal. Mas se você quer sobreviver aqui, vai precisar de uma arma. Vai até a loja e compra pelo menos uma faca. Sem arma, você é presa fácil.'",
    npcName: "Marcus 'O Veterano'",
    npcAvatar: "👴",
    requirement: { type: "weapon", target: "knife", current: 0 },
    reward: { money: 300, respect: 15, skillPoints: 1 },
    unlockLevel: 1,
    nextMission: "lucia_1",
  },
  {
    id: "lucia_1",
    name: "A Traficante",
    description: "Lúcia precisa de alguém para testar seu novo esquema",
    storyText: "Uma mulher elegante se aproxima. 'Me chamo Lúcia. Ouvi que você é novo mas promissor. Tenho um negócio para você: compre e venda drogas. Mostre que sabe fazer dinheiro.'",
    npcName: "Lúcia 'A Química'",
    npcAvatar: "👩‍🔬",
    requirement: { type: "money", target: 2000, current: 0 },
    reward: { money: 1000, respect: 30, skillPoints: 2 },
    unlockLevel: 2,
    nextMission: "viktor_1",
  },
  {
    id: "viktor_1",
    name: "O Russo",
    description: "Viktor quer ver se você tem força suficiente",
    storyText: "Um homem enorme com sotaque russo aparece. 'Sou Viktor. Preciso de gente forte na minha equipe. Treine sua força até 20. Então conversamos sobre trabalho de verdade.'",
    npcName: "Viktor 'O Gigante'",
    npcAvatar: "🧔",
    requirement: { type: "stat", target: 20, current: 0 },
    reward: { money: 1500, respect: 40, skillPoints: 2 },
    unlockLevel: 3,
    nextMission: "don_carlo_1",
  },
  {
    id: "don_carlo_1",
    name: "O Dom",
    description: "Don Carlo está recrutando para sua família",
    storyText: "Um homem de terno fino te chama. 'Jovem, impressionou muita gente. Sou Don Carlo. Para entrar na minha família, você precisa alcançar o nível 5. Mostre que tem ambição.'",
    npcName: "Don Carlo",
    npcAvatar: "🤵",
    requirement: { type: "level", target: 5, current: 0 },
    reward: { money: 5000, respect: 100, skillPoints: 3 },
    unlockLevel: 4,
    nextMission: "don_carlo_2",
  },
  {
    id: "don_carlo_2",
    name: "Negócios Legítimos",
    description: "Don Carlo quer que você invista em um negócio",
    storyText: "Don Carlo te convida para seu escritório. 'Agora você faz parte da família. Todo criminoso de respeito precisa de um negócio de fachada. Compre um terreno e construa qualquer negócio. É hora de pensar grande.'",
    npcName: "Don Carlo",
    npcAvatar: "🤵",
    requirement: { type: "business", target: "any", current: 0 },
    reward: { money: 10000, respect: 150, skillPoints: 4 },
    unlockLevel: 5,
    nextMission: "ghost_1",
  },
  {
    id: "ghost_1",
    name: "O Fantasma",
    description: "Uma figura misteriosa tem uma proposta arriscada",
    storyText: "Uma voz sai das sombras. 'Me chamam de Fantasma. Você chamou atenção das pessoas erradas... e certas. Mostre que é digno: cometa 50 crimes bem-sucedidos. Então, talvez eu te ensine alguns truques.'",
    npcName: "Fantasma",
    npcAvatar: "👤",
    requirement: { type: "crime", target: 50, current: 0 },
    reward: { money: 15000, respect: 200, skillPoints: 5 },
    unlockLevel: 7,
    nextMission: "final_mission",
  },
  {
    id: "final_mission",
    name: "O Golpe do Século",
    description: "Todos os seus contatos se unem para o maior golpe",
    storyText: "Marcus, Lúcia, Viktor, Don Carlo e o Fantasma te chamam. 'Está na hora. Vamos fazer o maior assalto que essa cidade já viu. Mas primeiro, você precisa estar no nível 10 e ter pelo menos $50.000. É tudo ou nada.'",
    npcName: "A Equipe",
    npcAvatar: "🎭",
    requirement: { type: "money", target: 50000, current: 0 },
    reward: { money: 100000, respect: 500, skillPoints: 10 },
    unlockLevel: 10,
  },
];

export function getMissionProgress(mission: Mission, player: any): number {
  switch (mission.requirement.type) {
    case "crime":
      return player.successfulCrimes;
    case "money":
      return player.money + player.bankMoney;
    case "level":
      return player.level;
    case "stat":
      return Math.max(
        player.stats.strength,
        player.stats.intelligence,
        player.stats.charisma,
        player.stats.tolerance
      );
    case "weapon":
      return player.weapons.some((w: any) => w.id === mission.requirement.target) ? 1 : 0;
    case "business":
      return player.businesses.length;
    default:
      return 0;
  }
}

export function canCompleteMission(mission: Mission, player: any): boolean {
  const progress = getMissionProgress(mission, player);
  const target = typeof mission.requirement.target === "string" ? 1 : mission.requirement.target;
  return progress >= target;
}

export function getAvailableMissions(player: any, completedMissions: string[]): Mission[] {
  return storyMissions.filter(mission => {
    // Já completou
    if (completedMissions.includes(mission.id)) return false;
    
    // Nível insuficiente
    if (player.level < mission.unlockLevel) return false;
    
    // Verifica se a missão anterior foi completada (se houver)
    const prevMission = storyMissions.find(m => m.nextMission === mission.id);
    if (prevMission && !completedMissions.includes(prevMission.id)) return false;
    
    return true;
  });
}

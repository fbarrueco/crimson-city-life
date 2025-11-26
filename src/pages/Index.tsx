import { useState, useEffect } from "react";
import { Player, Crime, Weapon, Profession, DrugOrder, CityLot, Business, DrugTransaction, GlobalEvent, Mission } from "@/types/game";
import { DailyMission, CityEvent } from "@/types/achievements";
import {
  createNewPlayer,
  saveGameState,
  loadGameState,
  updateEnergyRegen,
  executeCrime,
  buyWeapon,
  buyDrug,
  sellDrug,
  depositMoney,
  withdrawMoney,
  healPlayer,
  trainStat,
  professions,
} from "@/lib/gameLogic";
import { checkAchievements, generateDailyMissions, getRandomEvent, cityEvents } from "@/lib/achievements";
import { generateCityMap, businessTypes, calculateBusinessIncome, getUpgradeCost, generateBusinessEvent, employeeTypes } from "@/lib/cityMap";
import { createDrugOrder, matchOrders, getOrderBook, cleanOldTransactions } from "@/lib/drugMarket";
import { storyMissions, getAvailableMissions, canCompleteMission, getMissionProgress } from "@/lib/missions";
import { skillTree, Skill } from "@/types/skills";
import { GameHeader } from "@/components/GameHeader";
import { GameSidebar } from "@/components/GameSidebar";
import { CrimesSection } from "@/components/sections/CrimesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { HospitalSection } from "@/components/sections/HospitalSection";
import { BankSection } from "@/components/sections/BankSection";
import { WeaponsSection } from "@/components/sections/WeaponsSection";
import { DrugsSection } from "@/components/sections/DrugsSection";
import { AchievementsSection } from "@/components/sections/AchievementsSection";
import { MissionsSection } from "@/components/sections/MissionsSection";
import { StatsOverviewSection } from "@/components/sections/StatsOverviewSection";
import { ProfessionSection } from "@/components/sections/ProfessionSection";
import { EnhancedDrugsSection } from "@/components/sections/EnhancedDrugsSection";
import { CityMapSection } from "@/components/sections/CityMapSection";
import { BusinessManagementSection } from "@/components/sections/BusinessManagementSection";
import { SkillTreeSection } from "@/components/sections/SkillTreeSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeSection, setActiveSection] = useState("crimes");
  const [playerName, setPlayerName] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(generateDailyMissions());
  const [activeEvent, setActiveEvent] = useState<(CityEvent & { timeLeft: number }) | null>(null);
  const [globalEvent, setGlobalEvent] = useState<GlobalEvent | null>(null);
  const [drugOrders, setDrugOrders] = useState<DrugOrder[]>([]);
  const [cityLots, setCityLots] = useState<CityLot[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [drugTransactions, setDrugTransactions] = useState<DrugTransaction[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      const updatedPlayer = updateEnergyRegen(savedState.player, savedState.lastUpdate);
      setPlayer(updatedPlayer);
      setLastUpdate(Date.now());
      
      // Carregar ou inicializar dados do mundo
      if (savedState.drugOrders) setDrugOrders(savedState.drugOrders);
      if (savedState.cityLots && savedState.cityLots.length > 0) {
        setCityLots(savedState.cityLots);
      } else {
        setCityLots(generateCityMap());
      }
      if (savedState.businesses) setBusinesses(savedState.businesses);
      if (savedState.drugTransactions) setDrugTransactions(savedState.drugTransactions);
      if (savedState.activeEvent) setGlobalEvent(savedState.activeEvent);
    } else {
      // Inicializar mapa para novo jogo
      setCityLots(generateCityMap());
    }

    // Carregar conquistas
    const savedAchievements = localStorage.getItem("crimcity_achievements");
    if (savedAchievements) {
      setUnlockedAchievements(JSON.parse(savedAchievements));
    }

    // Carregar missões
    const savedMissions = localStorage.getItem("crimcity_missions");
    const lastMissionReset = localStorage.getItem("crimcity_mission_reset");
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;

    if (savedMissions && lastMissionReset && (now - parseInt(lastMissionReset)) < dayInMs) {
      setDailyMissions(JSON.parse(savedMissions));
    } else {
      const newMissions = generateDailyMissions();
      setDailyMissions(newMissions);
      localStorage.setItem("crimcity_missions", JSON.stringify(newMissions));
      localStorage.setItem("crimcity_mission_reset", now.toString());
    }
  }, []);

  useEffect(() => {
    if (!player) return;

    // Verificar conquistas
    const { newUnlocked, updatedList } = checkAchievements(player, unlockedAchievements);
    if (newUnlocked.length > 0) {
      setUnlockedAchievements(updatedList);
      localStorage.setItem("crimcity_achievements", JSON.stringify(updatedList));
      
      newUnlocked.forEach((achievement) => {
        toast({
          title: `🏆 Conquista Desbloqueada!`,
          description: `${achievement.icon} ${achievement.name}`,
        });
        
        // Dar recompensa
        if (achievement.reward.money || achievement.reward.respect) {
          setPlayer((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              money: prev.money + (achievement.reward.money || 0),
              respect: prev.respect + (achievement.reward.respect || 0),
            };
          });
        }
      });
    }

    const interval = setInterval(() => {
      // Chance de evento aleatório
      if (!activeEvent && Math.random() < 0.01) {
        const event = getRandomEvent();
        if (event) {
          setActiveEvent({ ...event, timeLeft: event.duration });
          toast({
            title: event.title,
            description: event.description,
          });
        }
      }

      // Reduzir tempo de evento ativo
      setActiveEvent(prev => {
        if (!prev) return null;
        const newTimeLeft = prev.timeLeft - 1;
        if (newTimeLeft <= 0) {
          toast({
            title: "⏰ Evento Finalizado",
            description: `${prev.title} terminou!`,
          });
          return null;
        }
        return { ...prev, timeLeft: newTimeLeft };
      });

      // Acumular renda dos negócios
      setBusinesses(prev =>
        prev.map(business => {
          const lot = cityLots.find(l => l.id === business.lotId);
          if (!lot) return business;

          const hourlyIncome = calculateBusinessIncome(business, lot);
          const secondlyIncome = hourlyIncome / 3600;
          
          // Verificar e gerar eventos de negócio (1% de chance por segundo)
          let updatedBusiness = { ...business };
          if (!updatedBusiness.activeEvent && Math.random() < 0.01) {
            const event = generateBusinessEvent(updatedBusiness);
            if (event) {
              updatedBusiness.activeEvent = event;
            }
          }
          
          // Processar evento ativo
          if (updatedBusiness.activeEvent) {
            const eventElapsed = Date.now() - updatedBusiness.activeEvent.timestamp;
            if (eventElapsed > (updatedBusiness.activeEvent.effect.duration || 0) * 1000) {
              updatedBusiness.activeEvent = null;
            }
          }

          return {
            ...updatedBusiness,
            accumulatedIncome: updatedBusiness.accumulatedIncome + secondlyIncome,
          };
        })
      );

      setPlayer((prev) => {
        if (!prev) return prev;
        
        let updated = { ...prev };
        
        // Regenera energia
        if (updated.energy < updated.maxEnergy) {
          updated.energy = Math.min(updated.energy + 1, updated.maxEnergy);
        }
        
        // Reduz tempo de prisão
        if (updated.inPrison && updated.prisonTime > 0) {
          updated.prisonTime -= 1;
          if (updated.prisonTime <= 0) {
            updated.inPrison = false;
            updated.prisonTime = 0;
            toast({
              title: "🔓 Liberdade!",
              description: "Você foi solto da prisão!",
            });
          }
        }
        
        return updated;
      });
      setLastUpdate(Date.now());
    }, 1000);

    // Limpar transações antigas a cada 5 minutos
    const cleanupInterval = setInterval(() => {
      setDrugTransactions(prev => cleanOldTransactions(prev));
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [player, toast, unlockedAchievements, activeEvent, cityLots]);

  useEffect(() => {
    if (player) {
      saveGameState(player, drugOrders, cityLots, businesses, drugTransactions, globalEvent);
    }
    if (dailyMissions) {
      localStorage.setItem("crimcity_missions", JSON.stringify(dailyMissions));
    }
  }, [player, lastUpdate, dailyMissions, drugOrders, cityLots, businesses, drugTransactions, globalEvent]);

  const handleStartGame = () => {
    if (playerName.trim()) {
      const newPlayer = createNewPlayer(playerName.trim());
      setPlayer(newPlayer);
      const initialLots = generateCityMap();
      setCityLots(initialLots);
      saveGameState(newPlayer, [], initialLots, [], [], null);
      toast({
        title: "🎮 Bem-vindo a CrimCity!",
        description: `Boa sorte, ${playerName}!`,
      });
    }
  };

  const handleCommitCrime = (crime: Crime) => {
    if (!player) return;
    
    const result = executeCrime(crime, player);
    setPlayer(result.player);
    
    // Atualizar missões
    if (result.success) {
      setDailyMissions((prev) =>
        prev.map((mission) => {
          if (mission.requirement.type === "crimes" && !mission.completed) {
            return { ...mission, progress: mission.progress + 1 };
          }
          return mission;
        })
      );
    }
    
    toast({
      title: result.success ? "✅ Crime bem-sucedido!" : "❌ Crime falhou!",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleBuyWeapon = (weapon: Weapon) => {
    if (!player) return;
    
    const result = buyWeapon(weapon, player);
    setPlayer(result.player);
    
    toast({
      title: result.success ? "🔫 Arma comprada!" : "❌ Falha na compra",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleBuyDrug = (drugId: string, quantity: number) => {
    if (!player) return;
    
    const result = buyDrug(drugId, quantity, player);
    setPlayer(result.player);
    
    toast({
      title: result.success ? "💊 Droga comprada!" : "❌ Falha na compra",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleSellDrug = (drugId: string, quantity: number) => {
    if (!player) return;
    
    const result = sellDrug(drugId, quantity, player);
    setPlayer(result.player);
    
    toast({
      title: result.success ? "💰 Droga vendida!" : "❌ Falha na venda",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleDeposit = (amount: number) => {
    if (!player) return;
    
    const result = depositMoney(amount, player);
    setPlayer(result.player);
    
    toast({
      title: result.success ? "🏦 Depósito realizado!" : "❌ Falha no depósito",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleWithdraw = (amount: number) => {
    if (!player) return;
    
    const result = withdrawMoney(amount, player);
    setPlayer(result.player);
    
    toast({
      title: result.success ? "💸 Saque realizado!" : "❌ Falha no saque",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleHeal = () => {
    if (!player) return;
    
    const result = healPlayer(player);
    setPlayer(result.player);
    
    toast({
      title: result.success ? "🏥 Curado!" : "❌ Falha na cura",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleTrainStat = (stat: keyof Player["stats"]) => {
    if (!player) return;
    
    const result = trainStat(stat, player);
    setPlayer(result.player);
    
    // Atualizar missões
    if (result.success) {
      setDailyMissions((prev) =>
        prev.map((mission) => {
          if (mission.requirement.type === "training" && !mission.completed) {
            return { ...mission, progress: mission.progress + 1 };
          }
          return mission;
        })
      );
    }
    
    toast({
      title: result.success ? "💪 Treino concluído!" : "❌ Falha no treino",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };

  const handleSelectProfession = (profession: Profession) => {
    if (!player || player.profession) return;
    
    const prof = professions.find(p => p.id === profession);
    if (!prof) return;
    
    const updatedPlayer = { ...player, profession };
    
    // Aplicar bônus de stats
    Object.entries(prof.bonus).forEach(([stat, bonus]) => {
      updatedPlayer.stats[stat as keyof Player["stats"]] += bonus;
    });
    
    setPlayer(updatedPlayer);
    toast({
      title: "💼 Profissão escolhida!",
      description: `Você agora é ${prof.name}!`,
    });
  };

  const handlePlaceDrugOrder = (
    drugId: string,
    type: "buy" | "sell",
    orderType: "market" | "limit",
    quantity: number,
    price?: number
  ) => {
    if (!player) return;
    
    const newOrder = createDrugOrder(drugId, type, orderType, quantity, price, player);
    const orderBook = getOrderBook(drugId, drugOrders);
    const result = matchOrders(newOrder, orderBook, player, drugTransactions);
    
    if (result.success || result.remainingOrder) {
      setPlayer(result.player);
      
      // Adicionar novas transações
      if (result.newTransactions.length > 0) {
        setDrugTransactions(prev => [...prev, ...result.newTransactions]);
      }
      
      // Remover ordens correspondidas do book
      const matchedIds = result.matchedOrders.map(o => o.id);
      setDrugOrders(prev => prev.filter(o => !matchedIds.includes(o.id)));
      
      // Adicionar ordem restante (só para ordens limite)
      if (result.remainingOrder) {
        setDrugOrders(prev => [...prev, result.remainingOrder!]);
      }
    }
    
    toast({
      title: result.success ? "📊 Ordem executada!" : result.remainingOrder ? "📋 Ordem no book" : "❌ Falha",
      description: result.message,
      variant: result.success ? "default" : result.remainingOrder ? "default" : "destructive",
    });
  };

  const handleBuyLot = (lotId: string) => {
    if (!player) return;
    
    const lot = cityLots.find(l => l.id === lotId);
    if (!lot || lot.ownerId || player.money < lot.basePrice) {
      toast({
        title: "❌ Não foi possível comprar",
        description: "Dinheiro insuficiente ou terreno já possui dono.",
        variant: "destructive",
      });
      return;
    }
    
    setPlayer({ ...player, money: player.money - lot.basePrice });
    setCityLots(prev => prev.map(l => 
      l.id === lotId ? { ...l, ownerId: player.name } : l
    ));
    
    toast({
      title: "🏘️ Terreno comprado!",
      description: `Você comprou um terreno por $${lot.basePrice}!`,
    });
  };

  const handleBuildBusiness = (lotId: string, businessType: string) => {
    if (!player) return;
    
    const lot = cityLots.find(l => l.id === lotId);
    const bizType = businessTypes.find(b => b.id === businessType);
    
    if (!lot || !bizType || lot.ownerId !== player.name || player.money < bizType.cost) {
      toast({
        title: "❌ Não foi possível construir",
        description: "Verifique os requisitos.",
        variant: "destructive",
      });
      return;
    }
    
    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      name: `${bizType.name} de ${player.name}`,
      type: businessType as any,
      ownerId: player.name,
      ownerName: player.name,
      lotId,
      level: 1,
      income: calculateBusinessIncome({ level: 1, popularity: 50, quality: 50, security: 30, employees: [] } as Business, lot),
      popularity: 50,
      lastCollection: Date.now(),
      employees: [],
      activeEvent: null,
      accumulatedIncome: 0,
      security: 30,
      quality: 50,
    };
    
    setPlayer({ ...player, money: player.money - bizType.cost, businesses: [...player.businesses, newBusiness.id] });
    setBusinesses(prev => [...prev, newBusiness]);
    setCityLots(prev => prev.map(l => 
      l.id === lotId ? { ...l, businessId: newBusiness.id } : l
    ));
    
    toast({
      title: "🏢 Negócio construído!",
      description: `${bizType.name} aberto com sucesso!`,
    });
  };

  const handleCollectIncome = (businessId: string) => {
    if (!player) return;
    
    const business = businesses.find(b => b.id === businessId);
    if (!business || business.accumulatedIncome === 0) return;
    
    setPlayer({ ...player, money: player.money + business.accumulatedIncome });
    setBusinesses(prev => prev.map(b =>
      b.id === businessId ? { ...b, accumulatedIncome: 0, lastCollection: Date.now() } : b
    ));
    
    toast({
      title: "💰 Renda coletada!",
      description: `Você coletou $${business.accumulatedIncome}!`,
    });
  };

  const handleUpgradeBusiness = (businessId: string) => {
    if (!player) return;
    
    const business = businesses.find(b => b.id === businessId);
    if (!business) return;
    
    const upgradeCost = getUpgradeCost(business);
    const bizType = businessTypes.find(b => b.id === business.type);
    
    if (!bizType || business.level >= bizType.maxLevel || player.money < upgradeCost) {
      toast({
        title: "❌ Upgrade não disponível",
        description: "Verifique requisitos ou nível máximo.",
        variant: "destructive",
      });
      return;
    }
    
    setPlayer({ ...player, money: player.money - upgradeCost });
    setBusinesses(prev => prev.map(b =>
      b.id === businessId ? { ...b, level: b.level + 1 } : b
    ));
    
    toast({
      title: "⬆️ Negócio melhorado!",
      description: `${business.name} agora é nível ${business.level + 1}!`,
    });
  };

  const handleHireEmployee = (businessId: string, employeeType: string) => {
    if (!player) return;
    
    const business = businesses.find(b => b.id === businessId);
    const empType = employeeTypes.find(e => e.type === employeeType);
    
    if (!business || !empType) return;
    
    const hiringCost = empType.baseSalary * 7; // 1 semana adiantado
    
    if (player.money < hiringCost) {
      toast({
        title: "❌ Dinheiro insuficiente",
        description: `Você precisa de $${hiringCost} para contratar.`,
        variant: "destructive",
      });
      return;
    }
    
    const newEmployee = {
      id: `emp_${Date.now()}`,
      name: `${empType.name} ${Math.floor(Math.random() * 100)}`,
      type: employeeType as any,
      skill: 50 + Math.floor(Math.random() * 50),
      salary: empType.baseSalary,
    };
    
    setPlayer({ ...player, money: player.money - hiringCost });
    setBusinesses(prev => prev.map(b =>
      b.id === businessId ? { ...b, employees: [...b.employees, newEmployee] } : b
    ));
    
    toast({
      title: "👔 Funcionário contratado!",
      description: `${newEmployee.name} agora trabalha para você!`,
    });
  };

  const handleImproveStat = (businessId: string, stat: "security" | "quality") => {
    if (!player) return;
    
    const business = businesses.find(b => b.id === businessId);
    if (!business || player.money < 5000) {
      toast({
        title: "❌ Não foi possível melhorar",
        description: "Dinheiro insuficiente ou stat no máximo.",
        variant: "destructive",
      });
      return;
    }
    
    if (business[stat] >= 100) {
      toast({
        title: "ℹ️ Máximo atingido",
        description: "Este atributo já está no máximo!",
      });
      return;
    }
    
    setPlayer({ ...player, money: player.money - 5000 });
    setBusinesses(prev => prev.map(b =>
      b.id === businessId ? { ...b, [stat]: Math.min(100, b[stat] + 10) } : b
    ));
    
    toast({
      title: "✨ Melhoria aplicada!",
      description: `${stat === "security" ? "Segurança" : "Qualidade"} melhorada!`,
    });
  };

  const handleClaimMissionReward = (missionId: string) => {
    const mission = dailyMissions.find((m) => m.id === missionId);
    if (!mission || !player) return;

    setPlayer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        money: prev.money + mission.reward.money,
        respect: prev.respect + mission.reward.respect,
      };
    });

    setDailyMissions((prev) =>
      prev.map((m) => (m.id === missionId ? { ...m, completed: true } : m))
    );

    toast({
      title: "🎁 Recompensa Resgatada!",
      description: `+$${mission.reward.money} e +${mission.reward.respect} respeito`,
    });
  };

  const handleUnlockSkill = (skillId: string) => {
    if (!player) return;
    
    const skill = skillTree.find(s => s.id === skillId);
    if (!skill) return;
    
    // Verificar se pode desbloquear
    if ((player.skillPoints || 0) < skill.cost) {
      toast({
        title: "❌ Pontos insuficientes",
        description: `Você precisa de ${skill.cost} pontos de habilidade.`,
        variant: "destructive",
      });
      return;
    }
    
    if (player.unlockedSkills?.includes(skillId)) {
      toast({
        title: "⚠️ Já desbloqueada",
        description: "Você já possui esta habilidade.",
        variant: "destructive",
      });
      return;
    }
    
    if (skill.requires) {
      const missingRequirements = skill.requires.filter(
        reqId => !(player.unlockedSkills || []).includes(reqId)
      );
      if (missingRequirements.length > 0) {
        toast({
          title: "❌ Requisitos não atendidos",
          description: "Desbloqueie as habilidades anteriores primeiro.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Desbloquear
    setPlayer({
      ...player,
      skillPoints: (player.skillPoints || 0) - skill.cost,
      unlockedSkills: [...(player.unlockedSkills || []), skillId],
    });
    
    toast({
      title: "🌟 Habilidade Desbloqueada!",
      description: `${skill.icon} ${skill.name}: ${skill.description}`,
    });
  };

  const handleCompleteStoryMission = (missionId: string) => {
    if (!player) return;
    
    const mission = storyMissions.find(m => m.id === missionId);
    if (!mission) return;
    
    if (!canCompleteMission(mission, player)) {
      toast({
        title: "❌ Missão incompleta",
        description: "Você ainda não cumpriu os requisitos.",
        variant: "destructive",
      });
      return;
    }
    
    if (player.completedMissions?.includes(missionId)) {
      toast({
        title: "⚠️ Já completada",
        description: "Você já completou esta missão.",
        variant: "destructive",
      });
      return;
    }
    
    // Completar missão
    setPlayer({
      ...player,
      money: player.money + mission.reward.money,
      respect: player.respect + mission.reward.respect,
      skillPoints: (player.skillPoints || 0) + (mission.reward.skillPoints || 0),
      completedMissions: [...(player.completedMissions || []), missionId],
      storyProgress: (player.storyProgress || 0) + 1,
    });
    
    toast({
      title: `🎭 Missão Completa: ${mission.name}`,
      description: `+$${mission.reward.money}, +${mission.reward.respect} respeito, +${mission.reward.skillPoints || 0} pontos de habilidade`,
    });
  };

  if (!player) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 border-border bg-card">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-primary mb-2">🏙️ CrimCity</h1>
            <p className="text-muted-foreground">Bem-vindo ao mundo do crime</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nome do Criminoso
              </label>
              <Input
                type="text"
                placeholder="Digite seu nome"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
                className="bg-input border-border"
              />
            </div>
            
            <Button onClick={handleStartGame} className="w-full" size="lg">
              Começar Jogo
            </Button>
          </div>

          <div className="mt-6 p-4 bg-secondary rounded text-sm text-muted-foreground">
            <p className="font-bold text-foreground mb-2">📋 Como Jogar:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Cometa crimes para ganhar dinheiro e respeito</li>
              <li>Melhore seus atributos treinando</li>
              <li>Guarde dinheiro no banco para protegê-lo</li>
              <li>Compre armas e drogas para lucrar</li>
              <li>Cuidado: crimes podem falhar e te mandar pra prisão!</li>
            </ul>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <GameHeader 
          player={player} 
          activeEvent={activeEvent ? {
            title: activeEvent.title,
            icon: activeEvent.icon,
            timeLeft: activeEvent.timeLeft
          } : null}
        />
        
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <GameSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </div>
          
          <div className="lg:col-span-3">
            <Card className="p-6 border-border bg-card min-h-[600px]">
              {activeSection === "crimes" && (
                <CrimesSection player={player} onCommitCrime={handleCommitCrime} />
              )}
              {activeSection === "stats" && (
                <StatsSection player={player} onTrainStat={handleTrainStat} />
              )}
              {activeSection === "hospital" && (
                <HospitalSection player={player} onHeal={handleHeal} />
              )}
              {activeSection === "bank" && (
                <BankSection
                  player={player}
                  onDeposit={handleDeposit}
                  onWithdraw={handleWithdraw}
                />
              )}
              {activeSection === "weapons" && (
                <WeaponsSection player={player} onBuyWeapon={handleBuyWeapon} />
              )}
              {activeSection === "drugs" && (
                <EnhancedDrugsSection
                  player={player}
                  allOrders={drugOrders}
                  onPlaceOrder={handlePlaceDrugOrder}
                />
              )}
              {activeSection === "profession" && (
                <ProfessionSection 
                  player={player} 
                  onSelectProfession={handleSelectProfession} 
                />
              )}
              {activeSection === "businesses" && (
                <CityMapSection
                  cityLots={cityLots}
                  businesses={businesses}
                  player={player}
                  onBuyLot={handleBuyLot}
                  onBuildBusiness={handleBuildBusiness}
                />
              )}
              {activeSection === "manage_businesses" && (
                <BusinessManagementSection
                  player={player}
                  businesses={businesses}
                  cityLots={cityLots}
                  onCollectIncome={handleCollectIncome}
                  onUpgradeBusiness={handleUpgradeBusiness}
                  onHireEmployee={handleHireEmployee}
                  onImproveStat={handleImproveStat}
                />
              )}
              {activeSection === "missions" && (
                <MissionsSection
                  missions={dailyMissions}
                  onClaimReward={handleClaimMissionReward}
                />
              )}
              {activeSection === "story" && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-4">📖 História</h2>
                  <p className="text-muted-foreground mb-6">
                    Complete missões de história para desbloquear a narrativa da cidade e ganhar recompensas poderosas.
                  </p>
                  <div className="space-y-4">
                    {getAvailableMissions(player, player.completedMissions || []).map(mission => {
                      const progress = getMissionProgress(mission, player);
                      const target = typeof mission.requirement.target === "string" ? 1 : mission.requirement.target;
                      const canComplete = canCompleteMission(mission, player);
                      
                      return (
                        <Card key={mission.id} className={`p-6 border-border ${canComplete ? "bg-accent/10 border-accent" : "bg-card"}`}>
                          <div className="flex items-start gap-4 mb-4">
                            <div className="text-5xl">{mission.npcAvatar}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-bold text-foreground">{mission.name}</h3>
                                <Badge variant="outline">Nível {mission.unlockLevel}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{mission.npcName}</p>
                              <p className="text-foreground italic mb-3">"{mission.storyText}"</p>
                              <p className="text-sm text-muted-foreground">{mission.description}</p>
                            </div>
                          </div>
                          
                          <div className="bg-muted/30 p-4 rounded-lg mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Progresso:</span>
                              <span className="text-foreground font-bold">{progress}/{target}</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div 
                                className="bg-accent rounded-full h-2 transition-all"
                                style={{ width: `${Math.min((progress / target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex gap-4 text-sm">
                              <span className="text-accent font-bold">+${mission.reward.money}</span>
                              <span className="text-primary">+{mission.reward.respect} respeito</span>
                              {mission.reward.skillPoints && (
                                <span className="text-foreground">+{mission.reward.skillPoints} 🌟</span>
                              )}
                            </div>
                            <Button
                              onClick={() => handleCompleteStoryMission(mission.id)}
                              disabled={!canComplete}
                              variant={canComplete ? "default" : "outline"}
                            >
                              {canComplete ? "Completar" : "Continuar"}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                    
                    {(player.completedMissions?.length || 0) > 0 && (
                      <Card className="p-4 bg-success/10 border-success">
                        <p className="text-sm text-muted-foreground text-center">
                          ✅ Missões completadas: {player.completedMissions?.length || 0}/{storyMissions.length}
                        </p>
                      </Card>
                    )}
                  </div>
                </div>
              )}
              {activeSection === "skills" && (
                <SkillTreeSection
                  player={player}
                  onUnlockSkill={handleUnlockSkill}
                />
              )}
              {activeSection === "achievements" && (
                <AchievementsSection
                  player={player}
                  unlockedAchievements={unlockedAchievements}
                />
              )}
              {activeSection === "overview" && (
                <StatsOverviewSection player={player} />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

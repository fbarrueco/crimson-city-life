import { useState, useEffect } from "react";
import { Player, Crime, Weapon, Profession, DrugOrder, CityLot, Business } from "@/types/game";
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
import { checkAchievements, generateDailyMissions, getRandomEvent } from "@/lib/achievements";
import { generateCityMap, businessTypes, calculateBusinessIncome } from "@/lib/cityMap";
import { createDrugOrder, matchOrders, getOrderBook } from "@/lib/drugMarket";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeSection, setActiveSection] = useState("crimes");
  const [playerName, setPlayerName] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(generateDailyMissions());
  const [activeEvent, setActiveEvent] = useState<(CityEvent & { timeLeft: number }) | null>(null);
  const [drugOrders, setDrugOrders] = useState<DrugOrder[]>([]);
  const [cityLots, setCityLots] = useState<CityLot[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
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

      // Reduz tempo do evento
      if (activeEvent) {
        setActiveEvent((prev) => {
          if (!prev) return null;
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            toast({
              title: "Evento Encerrado",
              description: `${prev.title} terminou!`,
            });
            return null;
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }

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

    return () => clearInterval(interval);
  }, [player, toast, unlockedAchievements, activeEvent]);

  useEffect(() => {
    if (player) {
      saveGameState(player, drugOrders, cityLots, businesses);
    }
    if (dailyMissions) {
      localStorage.setItem("crimcity_missions", JSON.stringify(dailyMissions));
    }
  }, [player, lastUpdate, dailyMissions, drugOrders, cityLots, businesses]);

  const handleStartGame = () => {
    if (playerName.trim()) {
      const newPlayer = createNewPlayer(playerName.trim());
      setPlayer(newPlayer);
      const initialLots = generateCityMap();
      setCityLots(initialLots);
      saveGameState(newPlayer, [], initialLots, []);
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
    const result = matchOrders(newOrder, orderBook, player);
    
    if (result.success) {
      setPlayer(result.player);
      
      // Remover ordens correspondidas
      const matchedIds = result.matchedOrders.map(o => o.id);
      setDrugOrders(prev => prev.filter(o => !matchedIds.includes(o.id)));
      
      // Adicionar ordem restante se houver
      if (result.remainingOrder) {
        setDrugOrders(prev => [...prev, result.remainingOrder!]);
      }
    }
    
    toast({
      title: result.success ? "📊 Ordem executada!" : "❌ Falha na ordem",
      description: result.message,
      variant: result.success ? "default" : "destructive",
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
      income: calculateBusinessIncome({ level: 1, popularity: 50 } as Business, lot),
      popularity: 50,
      lastCollection: Date.now(),
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
              {activeSection === "missions" && (
                <MissionsSection
                  missions={dailyMissions}
                  onClaimReward={handleClaimMissionReward}
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

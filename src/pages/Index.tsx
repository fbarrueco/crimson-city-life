import { useState, useEffect } from "react";
import { Player, Crime, Weapon } from "@/types/game";
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
} from "@/lib/gameLogic";
import { GameHeader } from "@/components/GameHeader";
import { GameSidebar } from "@/components/GameSidebar";
import { CrimesSection } from "@/components/sections/CrimesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { HospitalSection } from "@/components/sections/HospitalSection";
import { BankSection } from "@/components/sections/BankSection";
import { WeaponsSection } from "@/components/sections/WeaponsSection";
import { DrugsSection } from "@/components/sections/DrugsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeSection, setActiveSection] = useState("crimes");
  const [playerName, setPlayerName] = useState("");
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const { toast } = useToast();

  useEffect(() => {
    const savedState = loadGameState();
    if (savedState) {
      const updatedPlayer = updateEnergyRegen(savedState.player, savedState.lastUpdate);
      setPlayer(updatedPlayer);
      setLastUpdate(Date.now());
    }
  }, []);

  useEffect(() => {
    if (!player) return;

    const interval = setInterval(() => {
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
  }, [player, toast]);

  useEffect(() => {
    if (player) {
      saveGameState(player);
    }
  }, [player, lastUpdate]);

  const handleStartGame = () => {
    if (playerName.trim()) {
      const newPlayer = createNewPlayer(playerName.trim());
      setPlayer(newPlayer);
      saveGameState(newPlayer);
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
    
    toast({
      title: result.success ? "💪 Treino concluído!" : "❌ Falha no treino",
      description: result.message,
      variant: result.success ? "default" : "destructive",
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
        <GameHeader player={player} />
        
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
                <DrugsSection
                  player={player}
                  onBuyDrug={handleBuyDrug}
                  onSellDrug={handleSellDrug}
                />
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { Player } from "@/types/game";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Heart, Zap, DollarSign, Landmark, TrendingUp, AlertCircle } from "lucide-react";

interface GameHeaderProps {
  player: Player;
  activeEvent?: { title: string; icon: string; timeLeft: number } | null;
}

export function GameHeader({ player, activeEvent }: GameHeaderProps) {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const energyPercent = (player.energy / player.maxEnergy) * 100;

  return (
    <Card className="p-4 mb-4 border-border bg-card">
      {activeEvent && (
        <div className="mb-3 p-3 bg-warning/20 border border-warning rounded flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-warning" />
            <span className="font-bold text-warning">{activeEvent.title}</span>
          </div>
          <span className="text-sm text-muted-foreground">{activeEvent.timeLeft}s restantes</span>
        </div>
      )}

      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">{player.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Nível {player.level}
            </span>
            <span>•</span>
            <span>{player.respect.toLocaleString()} Respeito</span>
          </div>
        </div>
        {player.inPrison && (
          <div className="bg-danger px-3 py-1 rounded flex items-center gap-2">
            <span className="text-danger-foreground font-bold">🔒 PRESO</span>
            <span className="text-danger-foreground">{player.prisonTime}s</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          <div>
            <p className="text-xs text-muted-foreground">Dinheiro</p>
            <p className="text-lg font-bold text-accent">${player.money.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-success" />
          <div>
            <p className="text-xs text-muted-foreground">Banco</p>
            <p className="text-lg font-bold text-success">${player.bankMoney.toLocaleString()}</p>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Crimes</p>
          <p className="text-lg font-bold text-foreground">{player.successfulCrimes}/{player.crimes}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Armas</p>
          <p className="text-lg font-bold text-foreground">{player.weapons.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-danger" />
              <span className="text-muted-foreground">Saúde</span>
            </div>
            <span className="text-foreground font-bold">{player.health}/{player.maxHealth}</span>
          </div>
          <Progress value={healthPercent} className="h-2" />
        </div>
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-warning" />
              <span className="text-muted-foreground">Energia</span>
            </div>
            <span className="text-foreground font-bold">{player.energy}/{player.maxEnergy}</span>
          </div>
          <Progress value={energyPercent} className="h-2" />
        </div>
      </div>
    </Card>
  );
}

import { Player } from "@/types/game";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";

interface GameHeaderProps {
  player: Player;
}

export function GameHeader({ player }: GameHeaderProps) {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const energyPercent = (player.energy / player.maxEnergy) * 100;

  return (
    <Card className="p-4 mb-4 border-border bg-card">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">{player.name}</h1>
          <p className="text-sm text-muted-foreground">Nível {player.level} • {player.respect.toLocaleString()} Respeito</p>
        </div>
        {player.inPrison && (
          <div className="bg-danger px-3 py-1 rounded">
            <span className="text-danger-foreground font-bold">🔒 PRESO {player.prisonTime}s</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
        <div>
          <p className="text-xs text-muted-foreground">Dinheiro</p>
          <p className="text-lg font-bold text-accent">${player.money.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Banco</p>
          <p className="text-lg font-bold text-success">${player.bankMoney.toLocaleString()}</p>
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
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Saúde</span>
            <span className="text-foreground">{player.health}/{player.maxHealth}</span>
          </div>
          <Progress value={healthPercent} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Energia</span>
            <span className="text-foreground">{player.energy}/{player.maxEnergy}</span>
          </div>
          <Progress value={energyPercent} className="h-2" />
        </div>
      </div>
    </Card>
  );
}

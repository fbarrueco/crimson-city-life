import { Player, Crime } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { crimes, calculateCrimeSuccess } from "@/lib/gameLogic";
import { Progress } from "../ui/progress";

interface CrimesSectionProps {
  player: Player;
  onCommitCrime: (crime: Crime) => void;
}

export function CrimesSection({ player, onCommitCrime }: CrimesSectionProps) {
  const getSuccessChance = (crime: Crime) => {
    const baseChance = crime.successChance;
    const statBonus = (player.stats.intelligence + player.stats.strength) / 10;
    const levelBonus = player.level * 2;
    return Math.min(95, baseChance + statBonus + levelBonus);
  };

  const getChanceColor = (chance: number) => {
    if (chance >= 80) return "text-success";
    if (chance >= 60) return "text-warning";
    return "text-danger";
  };

  const availableCrimes = crimes.filter(c => c.requiredLevel <= player.level);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">🔪 Crimes Disponíveis</h2>
      <p className="text-muted-foreground mb-6">
        Escolha um crime para cometer. Quanto maior o risco, maior a recompensa!
      </p>

      <div className="grid gap-4">
        {availableCrimes.map((crime) => {
          const successChance = getSuccessChance(crime);
          const canCommit = player.energy >= crime.energyCost && !player.inPrison;

          return (
            <Card key={crime.id} className="p-4 border-border bg-card hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{crime.name}</h3>
                  <p className="text-sm text-muted-foreground">Nível mínimo: {crime.requiredLevel}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold">${crime.reward}</p>
                  <p className="text-primary text-sm">+{crime.respect} respeito</p>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Chance de sucesso:</span>
                  <span className={`font-bold ${getChanceColor(successChance)}`}>
                    {successChance.toFixed(0)}%
                  </span>
                </div>
                <Progress value={successChance} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Energia necessária:</span>
                  <span className="text-foreground">{crime.energyCost}</span>
                </div>
              </div>

              <Button
                onClick={() => onCommitCrime(crime)}
                disabled={!canCommit}
                variant="default"
                className="w-full"
              >
                {!canCommit && player.inPrison && "Você está preso!"}
                {!canCommit && !player.inPrison && player.energy < crime.energyCost && "Energia insuficiente"}
                {canCommit && "Cometer Crime"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

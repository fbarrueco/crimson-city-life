import { Player } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Progress } from "../ui/progress";

interface HospitalSectionProps {
  player: Player;
  onHeal: () => void;
}

export function HospitalSection({ player, onHeal }: HospitalSectionProps) {
  const healthPercent = (player.health / player.maxHealth) * 100;
  const healthNeeded = player.maxHealth - player.health;
  const cost = healthNeeded * 5;
  const canAfford = player.money >= cost;
  const needsHealing = healthNeeded > 0;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">🏥 Hospital</h2>
      <p className="text-muted-foreground mb-6">
        Cure seus ferimentos aqui. Custa $5 por ponto de vida.
      </p>

      <Card className="p-6 border-border bg-card">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏥</div>
          <h3 className="text-2xl font-bold text-foreground mb-2">Status de Saúde</h3>
          <p className="text-4xl font-bold text-primary mb-4">
            {player.health}/{player.maxHealth}
          </p>
          <Progress value={healthPercent} className="h-4 mb-2" />
        </div>

        {needsHealing ? (
          <div className="space-y-4">
            <div className="bg-secondary p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">Vida necessária:</span>
                <span className="text-foreground font-bold">{healthNeeded} HP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Custo total:</span>
                <span className="text-accent font-bold text-xl">${cost}</span>
              </div>
            </div>

            <Button
              onClick={onHeal}
              disabled={!canAfford}
              variant="default"
              className="w-full"
              size="lg"
            >
              {canAfford ? "Curar Completamente" : "Dinheiro Insuficiente"}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-success font-bold text-xl">✅ Você está com saúde máxima!</p>
          </div>
        )}
      </Card>
    </div>
  );
}

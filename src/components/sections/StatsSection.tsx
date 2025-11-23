import { Player } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

interface StatsSectionProps {
  player: Player;
  onTrainStat: (stat: keyof Player["stats"]) => void;
}

export function StatsSection({ player, onTrainStat }: StatsSectionProps) {
  const stats: { key: keyof Player["stats"]; label: string; icon: string; description: string }[] = [
    { key: "strength", label: "Força", icon: "💪", description: "Aumenta dano e chance em crimes físicos" },
    { key: "intelligence", label: "Inteligência", icon: "🧠", description: "Melhora planejamento e crimes complexos" },
    { key: "charisma", label: "Carisma", icon: "😎", description: "Ajuda em negociações e gangues" },
    { key: "tolerance", label: "Tolerância", icon: "🛡️", description: "Reduz dano recebido e tempo de prisão" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">💪 Treinar Atributos</h2>
      <p className="text-muted-foreground mb-6">
        Melhore seus atributos para aumentar suas chances de sucesso nos crimes.
      </p>

      <div className="grid gap-4">
        {stats.map((stat) => {
          const cost = player.stats[stat.key] * 50;
          const canAfford = player.money >= cost;

          return (
            <Card key={stat.key} className="p-4 border-border bg-card">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {stat.icon} {stat.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary">{player.stats[stat.key]}</p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Custo: <span className="text-accent font-bold">${cost}</span>
                </span>
                <Button
                  onClick={() => onTrainStat(stat.key)}
                  disabled={!canAfford}
                  variant="default"
                >
                  {canAfford ? "Treinar" : "Sem dinheiro"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

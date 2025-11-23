import { Card } from "../ui/card";
import { Player } from "@/types/game";
import { Progress } from "../ui/progress";
import { TrendingUp, TrendingDown, Trophy, Target, DollarSign, Activity } from "lucide-react";

interface StatsOverviewSectionProps {
  player: Player;
}

export function StatsOverviewSection({ player }: StatsOverviewSectionProps) {
  const successRate = player.crimes > 0 
    ? ((player.successfulCrimes / player.crimes) * 100).toFixed(1)
    : 0;
  
  const totalWealth = player.money + player.bankMoney;
  const weaponPower = player.weapons.reduce((sum, w) => sum + w.damage, 0);
  const avgStat = (player.stats.strength + player.stats.intelligence + player.stats.charisma + player.stats.tolerance) / 4;

  const stats = [
    {
      label: "Taxa de Sucesso",
      value: `${successRate}%`,
      icon: Target,
      color: "text-success",
      subtext: `${player.successfulCrimes}/${player.crimes} crimes`,
    },
    {
      label: "Patrimônio Total",
      value: `$${totalWealth.toLocaleString()}`,
      icon: DollarSign,
      color: "text-accent",
      subtext: `$${player.money} em mãos`,
    },
    {
      label: "Poder de Combate",
      value: weaponPower,
      icon: Activity,
      color: "text-danger",
      subtext: `${player.weapons.length} armas`,
    },
    {
      label: "Média de Stats",
      value: avgStat.toFixed(0),
      icon: TrendingUp,
      color: "text-primary",
      subtext: "Atributos gerais",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">📊 Estatísticas</h2>
      <p className="text-muted-foreground mb-6">
        Acompanhe seu progresso e desempenho na vida do crime.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-accent" />
            Ranking de Atributos
          </h3>
          <div className="space-y-4">
            {Object.entries(player.stats).map(([key, value]) => {
              const statNames: Record<string, string> = {
                strength: "Força",
                intelligence: "Inteligência",
                charisma: "Carisma",
                tolerance: "Tolerância",
              };
              const percent = (value / 100) * 100; // Assumindo max 100

              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{statNames[key]}</span>
                    <span className="text-foreground font-bold">{value}</span>
                  </div>
                  <Progress value={percent} className="h-2" />
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-4">🎯 Desempenho</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-secondary rounded">
              <span className="text-muted-foreground">Nível Atual</span>
              <span className="text-2xl font-bold text-primary">{player.level}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded">
              <span className="text-muted-foreground">Respeito Total</span>
              <span className="text-2xl font-bold text-accent">{player.respect}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-secondary rounded">
              <span className="text-muted-foreground">Próximo Nível</span>
              <span className="text-lg font-bold text-foreground">
                {player.level * 100 - player.respect} respeito
              </span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Progresso para nível {player.level + 1}</p>
              <Progress 
                value={(player.respect / (player.level * 100)) * 100} 
                className="h-3" 
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

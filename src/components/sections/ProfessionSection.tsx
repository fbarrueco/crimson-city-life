import { Player, Profession } from "@/types/game";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Briefcase, Zap, Brain, MessageSquare, Shield, Swords } from "lucide-react";
import { professions } from "@/lib/gameLogic";

interface ProfessionSectionProps {
  player: Player;
  onSelectProfession: (profession: Profession) => void;
}

const professionIcons: Record<string, any> = {
  thug: Swords,
  hacker: Brain,
  dealer: Briefcase,
  conman: MessageSquare,
  enforcer: Shield,
};

export function ProfessionSection({ player, onSelectProfession }: ProfessionSectionProps) {
  if (player.profession) {
    const currentProf = professions.find(p => p.id === player.profession);
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-6 w-6" />
          Sua Profissão
        </h2>
        <Card className="p-6 border-primary bg-card">
          <div className="flex items-start gap-4">
            {currentProf && professionIcons[currentProf.id] && (
              <div className="p-3 bg-primary/20 rounded-lg">
                {(() => {
                  const Icon = professionIcons[currentProf.id];
                  return <Icon className="h-8 w-8 text-primary" />;
                })()}
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">{currentProf?.name}</h3>
              <div className="space-y-2">
                <p className="text-muted-foreground">Bônus de Stats:</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(currentProf?.bonus || {}).map(([stat, value]) => (
                    <Badge key={stat} variant="secondary">
                      +{value} {stat === "strength" ? "Força" : stat === "intelligence" ? "Inteligência" : stat === "charisma" ? "Carisma" : "Tolerância"}
                    </Badge>
                  ))}
                </div>
                {currentProf?.crimeBonus && (
                  <p className="text-success">+{currentProf.crimeBonus}% chance em crimes</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Briefcase className="h-6 w-6" />
        Escolha sua Profissão
      </h2>
      <p className="text-muted-foreground mb-6">
        Escolha uma profissão para ganhar bônus permanentes. Esta escolha não pode ser alterada!
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        {professions.map((prof) => {
          const Icon = professionIcons[prof.id];
          return (
            <Card key={prof.id} className="p-4 border-border bg-card hover:border-primary transition-colors">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{prof.name}</h3>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-muted-foreground">Bônus de Stats:</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(prof.bonus).map(([stat, value]) => (
                    <Badge key={stat} variant="secondary">
                      +{value} {stat === "strength" ? "Força" : stat === "intelligence" ? "Inteligência" : stat === "charisma" ? "Carisma" : "Tolerância"}
                    </Badge>
                  ))}
                </div>
                {prof.crimeBonus && (
                  <p className="text-sm text-success">+{prof.crimeBonus}% chance de sucesso em crimes</p>
                )}
                {prof.drugBonus && (
                  <p className="text-sm text-success">+{prof.drugBonus}% lucro em negociações de drogas</p>
                )}
                {prof.combatBonus && (
                  <p className="text-sm text-success">+{prof.combatBonus}% efetividade em combate</p>
                )}
              </div>

              <Button 
                onClick={() => onSelectProfession(prof.id as Profession)}
                className="w-full"
              >
                Escolher Profissão
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

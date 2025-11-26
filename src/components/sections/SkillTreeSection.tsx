import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Player } from "@/types/game";
import { skillTree, Skill } from "@/types/skills";
import { Lock, Check } from "lucide-react";

interface SkillTreeSectionProps {
  player: Player;
  onUnlockSkill: (skillId: string) => void;
}

export function SkillTreeSection({ player, onUnlockSkill }: SkillTreeSectionProps) {
  const categories = ["combat", "business", "stealth", "social"] as const;
  const categoryNames = {
    combat: "Combate",
    business: "Negócios",
    stealth: "Furtividade",
    social: "Social",
  };
  const categoryIcons = {
    combat: "⚔️",
    business: "💼",
    stealth: "🥷",
    social: "🤝",
  };

  const canUnlock = (skill: Skill): boolean => {
    if (player.unlockedSkills.includes(skill.id)) return false;
    if (player.skillPoints < skill.cost) return false;
    if (!skill.requires) return true;
    return skill.requires.every(reqId => player.unlockedSkills.includes(reqId));
  };

  const isLocked = (skill: Skill): boolean => {
    if (player.unlockedSkills.includes(skill.id)) return false;
    if (!skill.requires) return false;
    return !skill.requires.every(reqId => player.unlockedSkills.includes(reqId));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">🌟 Árvore de Habilidades</h2>
          <p className="text-muted-foreground">
            Desbloqueie habilidades poderosas para dominar a cidade
          </p>
        </div>
        <Card className="p-4 bg-accent/10 border-accent">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Pontos Disponíveis</p>
            <p className="text-3xl font-bold text-accent">{player.skillPoints}</p>
          </div>
        </Card>
      </div>

      <div className="space-y-8">
        {categories.map(category => {
          const categorySkills = skillTree.filter(s => s.category === category);
          const tier1 = categorySkills.filter(s => s.tier === 1);
          const tier2 = categorySkills.filter(s => s.tier === 2);
          const tier3 = categorySkills.filter(s => s.tier === 3);

          return (
            <Card key={category} className="p-6 border-border bg-card/50">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">{categoryIcons[category]}</span>
                <h3 className="text-2xl font-bold text-foreground">
                  {categoryNames[category]}
                </h3>
              </div>

              <div className="space-y-6">
                {/* Tier 1 */}
                <div>
                  <Badge variant="outline" className="mb-3">Tier 1 - Básico</Badge>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tier1.map(skill => (
                      <SkillCard
                        key={skill.id}
                        skill={skill}
                        isUnlocked={player.unlockedSkills.includes(skill.id)}
                        isLocked={isLocked(skill)}
                        canUnlock={canUnlock(skill)}
                        onUnlock={() => onUnlockSkill(skill.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Tier 2 */}
                {tier2.length > 0 && (
                  <div>
                    <Badge variant="outline" className="mb-3 border-accent/50">
                      Tier 2 - Avançado
                    </Badge>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tier2.map(skill => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          isUnlocked={player.unlockedSkills.includes(skill.id)}
                          isLocked={isLocked(skill)}
                          canUnlock={canUnlock(skill)}
                          onUnlock={() => onUnlockSkill(skill.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Tier 3 */}
                {tier3.length > 0 && (
                  <div>
                    <Badge variant="outline" className="mb-3 border-primary">
                      Tier 3 - Mestre
                    </Badge>
                    <div className="grid grid-cols-1 gap-4">
                      {tier3.map(skill => (
                        <SkillCard
                          key={skill.id}
                          skill={skill}
                          isUnlocked={player.unlockedSkills.includes(skill.id)}
                          isLocked={isLocked(skill)}
                          canUnlock={canUnlock(skill)}
                          onUnlock={() => onUnlockSkill(skill.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

interface SkillCardProps {
  skill: Skill;
  isUnlocked: boolean;
  isLocked: boolean;
  canUnlock: boolean;
  onUnlock: () => void;
}

function SkillCard({ skill, isUnlocked, isLocked, canUnlock, onUnlock }: SkillCardProps) {
  return (
    <Card
      className={`p-4 transition-all ${
        isUnlocked
          ? "bg-success/10 border-success"
          : isLocked
          ? "bg-muted/30 border-muted opacity-60"
          : canUnlock
          ? "bg-accent/10 border-accent hover:border-accent/80"
          : "bg-card border-border"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{skill.icon}</span>
          <div>
            <h4 className="font-bold text-foreground flex items-center gap-2">
              {skill.name}
              {isUnlocked && <Check className="w-4 h-4 text-success" />}
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
            </h4>
            <p className="text-xs text-muted-foreground">Tier {skill.tier}</p>
          </div>
        </div>
        <Badge
          variant={isUnlocked ? "default" : "outline"}
          className={isUnlocked ? "bg-success" : ""}
        >
          {skill.cost} {skill.cost === 1 ? "ponto" : "pontos"}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>

      {skill.requires && (
        <p className="text-xs text-muted-foreground mb-3">
          Requer: {skill.requires.map(id => skillTree.find(s => s.id === id)?.name).join(", ")}
        </p>
      )}

      {!isUnlocked && !isLocked && (
        <Button
          onClick={onUnlock}
          disabled={!canUnlock}
          variant={canUnlock ? "default" : "outline"}
          className="w-full"
          size="sm"
        >
          {canUnlock ? "Desbloquear" : "Pontos Insuficientes"}
        </Button>
      )}
    </Card>
  );
}

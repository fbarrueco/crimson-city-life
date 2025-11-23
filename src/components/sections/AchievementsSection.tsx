import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { Player } from "@/types/game";
import { achievements } from "@/lib/achievements";
import { Badge } from "../ui/badge";

interface AchievementsSectionProps {
  player: Player;
  unlockedAchievements: string[];
}

export function AchievementsSection({ player, unlockedAchievements }: AchievementsSectionProps) {
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;
  const completionPercent = (unlockedCount / totalCount) * 100;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">🏆 Conquistas</h2>
      <p className="text-muted-foreground mb-6">
        Complete desafios para ganhar recompensas especiais!
      </p>

      <Card className="p-6 mb-6 border-border bg-card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-foreground">Progresso Total</h3>
          <span className="text-2xl font-bold text-primary">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <Progress value={completionPercent} className="h-3" />
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const isUnlocked = unlockedAchievements.includes(achievement.id);
          const canUnlock = achievement.requirement(player);

          return (
            <Card
              key={achievement.id}
              className={`p-4 border-border transition-all ${
                isUnlocked
                  ? "bg-accent/10 border-accent"
                  : canUnlock
                  ? "bg-warning/10 border-warning"
                  : "bg-card opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {achievement.name}
                    </h3>
                    {isUnlocked && (
                      <Badge variant="default" className="bg-success">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex gap-3 text-sm">
                    {achievement.reward.money && (
                      <span className="text-accent font-bold">
                        +${achievement.reward.money}
                      </span>
                    )}
                    {achievement.reward.respect && (
                      <span className="text-primary font-bold">
                        +{achievement.reward.respect} respeito
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

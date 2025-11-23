import { Card } from "../ui/card";
import { Progress } from "../ui/progress";
import { DailyMission } from "@/types/achievements";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface MissionsSectionProps {
  missions: DailyMission[];
  onClaimReward: (missionId: string) => void;
}

export function MissionsSection({ missions, onClaimReward }: MissionsSectionProps) {
  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">📋 Missões Diárias</h2>
      <p className="text-muted-foreground mb-6">
        Complete missões diárias para ganhar recompensas extras! Renovam a cada 24h.
      </p>

      <Card className="p-4 mb-6 border-border bg-card">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Missões Completas Hoje:</span>
          <Badge variant="default" className="text-lg px-4 py-1">
            {completedCount}/{missions.length}
          </Badge>
        </div>
      </Card>

      <div className="space-y-4">
        {missions.map((mission) => {
          const progressPercent = Math.min(
            (mission.progress / mission.requirement.target) * 100,
            100
          );
          const canClaim = mission.progress >= mission.requirement.target && !mission.completed;

          return (
            <Card
              key={mission.id}
              className={`p-4 border-border ${
                mission.completed
                  ? "bg-success/10 border-success"
                  : canClaim
                  ? "bg-accent/10 border-accent"
                  : "bg-card"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold text-foreground">{mission.name}</h3>
                    {mission.completed && (
                      <Badge variant="default" className="bg-success">
                        ✓ Completa
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{mission.description}</p>
                </div>
                {!mission.completed && (
                  <div className="text-right text-sm">
                    <p className="text-accent font-bold">+${mission.reward.money}</p>
                    <p className="text-primary">+{mission.reward.respect} respeito</p>
                  </div>
                )}
              </div>

              {!mission.completed && (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progresso:</span>
                    <span className="text-foreground font-bold">
                      {mission.progress}/{mission.requirement.target}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2 mb-3" />
                </>
              )}

              {canClaim && (
                <Button
                  onClick={() => onClaimReward(mission.id)}
                  variant="default"
                  className="w-full"
                >
                  Resgatar Recompensa
                </Button>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

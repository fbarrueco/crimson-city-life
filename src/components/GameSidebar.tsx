import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Swords, Dumbbell, Hospital, Landmark, Crosshair, Pill, Trophy, ListTodo, BarChart3, Briefcase, Building2 } from "lucide-react";

interface GameSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "crimes", label: "Crimes", icon: Swords },
  { id: "stats", label: "Treinar", icon: Dumbbell },
  { id: "profession", label: "Profissão", icon: Briefcase },
  { id: "hospital", label: "Hospital", icon: Hospital },
  { id: "bank", label: "Banco", icon: Landmark },
  { id: "weapons", label: "Armas", icon: Crosshair },
  { id: "drugs", label: "Drogas", icon: Pill },
  { id: "businesses", label: "Negócios", icon: Building2 },
  { id: "missions", label: "Missões", icon: ListTodo },
  { id: "achievements", label: "Conquistas", icon: Trophy },
  { id: "overview", label: "Estatísticas", icon: BarChart3 },
];

export function GameSidebar({ activeSection, onSectionChange }: GameSidebarProps) {
  return (
    <Card className="p-4 border-border bg-card sticky top-4">
      <h2 className="text-xl font-bold text-primary mb-4">🏙️ CrimCity</h2>
      <div className="space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "secondary"}
              className="w-full justify-start"
              onClick={() => onSectionChange(section.id)}
            >
              <Icon className="h-4 w-4 mr-2" />
              {section.label}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}

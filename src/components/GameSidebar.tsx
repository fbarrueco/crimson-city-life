import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface GameSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const sections = [
  { id: "crimes", label: "🔪 Crimes", color: "danger" },
  { id: "stats", label: "💪 Treinar", color: "primary" },
  { id: "hospital", label: "🏥 Hospital", color: "success" },
  { id: "bank", label: "🏦 Banco", color: "accent" },
  { id: "weapons", label: "🔫 Armas", color: "destructive" },
  { id: "drugs", label: "💊 Drogas", color: "warning" },
];

export function GameSidebar({ activeSection, onSectionChange }: GameSidebarProps) {
  return (
    <Card className="p-4 border-border bg-card sticky top-4">
      <h2 className="text-xl font-bold text-primary mb-4">🏙️ CrimCity</h2>
      <div className="space-y-2">
        {sections.map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "secondary"}
            className="w-full justify-start"
            onClick={() => onSectionChange(section.id)}
          >
            {section.label}
          </Button>
        ))}
      </div>
    </Card>
  );
}

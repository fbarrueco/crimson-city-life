import { Player, Weapon } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { weapons } from "@/lib/gameLogic";

interface WeaponsSectionProps {
  player: Player;
  onBuyWeapon: (weapon: Weapon) => void;
}

export function WeaponsSection({ player, onBuyWeapon }: WeaponsSectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">🔫 Loja de Armas</h2>
      <p className="text-muted-foreground mb-6">
        Compre armas para aumentar seu poder em combates e crimes violentos.
      </p>

      {player.weapons.length > 0 && (
        <Card className="p-4 mb-6 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">🎒 Seu Arsenal</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {player.weapons.map((weapon) => (
              <div key={weapon.id} className="bg-secondary p-3 rounded">
                <p className="font-bold text-foreground">{weapon.name}</p>
                <p className="text-sm text-primary">Dano: {weapon.damage}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {weapons.map((weapon) => {
          const owned = player.weapons.find(w => w.id === weapon.id);
          const canAfford = player.money >= weapon.price;

          return (
            <Card key={weapon.id} className="p-4 border-border bg-card hover:border-primary transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{weapon.name}</h3>
                  <p className="text-primary font-bold">Dano: {weapon.damage}</p>
                </div>
                <div className="text-right">
                  <p className="text-accent font-bold text-xl">${weapon.price.toLocaleString()}</p>
                </div>
              </div>

              <Button
                onClick={() => onBuyWeapon(weapon)}
                disabled={owned !== undefined || !canAfford}
                variant={owned ? "secondary" : "default"}
                className="w-full"
              >
                {owned ? "✅ Adquirido" : canAfford ? "Comprar" : "Sem dinheiro"}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

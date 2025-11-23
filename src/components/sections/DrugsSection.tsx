import { Player } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { drugTypes } from "@/lib/gameLogic";
import { useState } from "react";

interface DrugsSectionProps {
  player: Player;
  onBuyDrug: (drugId: string, quantity: number) => void;
  onSellDrug: (drugId: string, quantity: number) => void;
}

export function DrugsSection({ player, onBuyDrug, onSellDrug }: DrugsSectionProps) {
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const handleBuy = (drugId: string) => {
    const quantity = parseInt(quantities[drugId] || "0");
    if (quantity > 0) {
      onBuyDrug(drugId, quantity);
      setQuantities({ ...quantities, [drugId]: "" });
    }
  };

  const handleSell = (drugId: string) => {
    const quantity = parseInt(quantities[`sell_${drugId}`] || "0");
    if (quantity > 0) {
      onSellDrug(drugId, quantity);
      setQuantities({ ...quantities, [`sell_${drugId}`]: "" });
    }
  };

  const getCurrentPrice = (basePrice: number, isSelling: boolean) => {
    const variance = isSelling ? (1 + Math.random() * 0.6) : (0.8 + Math.random() * 0.4);
    return Math.floor(basePrice * variance);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4">💊 Mercado de Drogas</h2>
      <p className="text-muted-foreground mb-6">
        Compre drogas baratas e venda por mais caro para lucrar. Os preços variam!
      </p>

      {player.drugs.length > 0 && (
        <Card className="p-4 mb-6 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">🎒 Seu Estoque</h3>
          <div className="grid gap-3">
            {player.drugs.map((drug) => {
              const drugType = drugTypes.find(d => d.id === drug.id);
              if (!drugType) return null;

              return (
                <div key={drug.id} className="bg-secondary p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="font-bold text-foreground">{drug.name}</p>
                    <p className="text-sm text-muted-foreground">{drug.quantity}g em estoque</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      value={quantities[`sell_${drug.id}`] || ""}
                      onChange={(e) => setQuantities({ ...quantities, [`sell_${drug.id}`]: e.target.value })}
                      className="w-20 bg-input border-border"
                    />
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleSell(drug.id)}
                    >
                      Vender
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {drugTypes.map((drug) => {
          const buyPrice = getCurrentPrice(drug.basePrice, false);
          const sellPrice = getCurrentPrice(drug.basePrice, true);

          return (
            <Card key={drug.id} className="p-4 border-border bg-card hover:border-warning transition-colors">
              <h3 className="text-lg font-bold text-foreground mb-3">💊 {drug.name}</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço de compra:</span>
                  <span className="text-accent font-bold">${buyPrice}/g</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Preço de venda:</span>
                  <span className="text-success font-bold">${sellPrice}/g</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Quantidade (g)"
                  value={quantities[drug.id] || ""}
                  onChange={(e) => setQuantities({ ...quantities, [drug.id]: e.target.value })}
                  className="bg-input border-border"
                />
                <Button onClick={() => handleBuy(drug.id)} variant="default">
                  Comprar
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

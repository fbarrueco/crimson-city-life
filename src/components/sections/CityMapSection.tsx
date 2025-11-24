import { CityLot, Player, Business } from "@/types/game";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { Map, Building2, DollarSign } from "lucide-react";
import { businessTypes } from "@/lib/cityMap";

interface CityMapSectionProps {
  cityLots: CityLot[];
  businesses: Business[];
  player: Player;
  onBuyLot: (lotId: string) => void;
  onBuildBusiness: (lotId: string, businessType: string) => void;
}

const districtColors: Record<string, string> = {
  downtown: "bg-primary/20 border-primary",
  port: "bg-blue-500/20 border-blue-500",
  suburbs: "bg-green-500/20 border-green-500",
  industrial: "bg-yellow-500/20 border-yellow-500",
  slums: "bg-gray-500/20 border-gray-500",
};

const districtNames: Record<string, string> = {
  downtown: "Centro",
  port: "Porto",
  suburbs: "Subúrbios",
  industrial: "Industrial",
  slums: "Favela",
};

export function CityMapSection({ cityLots, businesses, player, onBuyLot, onBuildBusiness }: CityMapSectionProps) {
  const [selectedLot, setSelectedLot] = useState<CityLot | null>(null);
  const [buildingType, setBuildingType] = useState<string | null>(null);

  const gridSize = 20;

  const handleLotClick = (lot: CityLot) => {
    setSelectedLot(lot);
    setBuildingType(null);
  };

  const playerLots = cityLots.filter(l => l.ownerId === player.name);
  const selectedBusiness = selectedLot?.businessId 
    ? businesses.find(b => b.id === selectedLot.businessId)
    : null;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Map className="h-6 w-6" />
        Mapa da Cidade
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <Card className="lg:col-span-2 p-4 border-border bg-card">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground mb-2">CrimCity</h3>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(districtNames).map(([key, name]) => (
                <Badge key={key} className={districtColors[key]}>
                  {name}
                </Badge>
              ))}
            </div>
          </div>

          <div 
            className="grid gap-0.5 bg-background p-2 rounded overflow-auto"
            style={{ 
              gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
              maxHeight: "600px"
            }}
          >
            {cityLots.map((lot) => {
              const isSelected = selectedLot?.id === lot.id;
              const isOwned = lot.ownerId === player.name;
              const hasBusiness = lot.businessId !== null;

              return (
                <button
                  key={lot.id}
                  onClick={() => handleLotClick(lot)}
                  className={`
                    aspect-square border transition-all
                    ${districtColors[lot.district]}
                    ${isSelected ? "ring-2 ring-primary scale-110 z-10" : ""}
                    ${isOwned ? "border-warning border-2" : ""}
                    ${hasBusiness ? "bg-warning/30" : ""}
                    hover:scale-105 hover:z-10
                  `}
                  title={`${districtNames[lot.district]} - $${lot.basePrice}`}
                >
                  {hasBusiness && (
                    <Building2 className="h-3 w-3 mx-auto text-foreground" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            <p>🟨 Seus terrenos | 🏢 Negócios ativos</p>
          </div>
        </Card>

        {/* Info e Ações */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">Detalhes do Terreno</h3>

          {selectedLot ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="text-foreground font-bold">
                  {districtNames[selectedLot.district]} ({selectedLot.x}, {selectedLot.y})
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Preço do Terreno</p>
                <p className="text-lg font-bold text-foreground">${selectedLot.basePrice}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Modificador</p>
                <p className="text-foreground">{(selectedLot.modifier * 100).toFixed(0)}%</p>
              </div>

              {selectedLot.ownerId === player.name ? (
                <>
                  {selectedBusiness ? (
                    <div className="p-3 bg-success/10 rounded border border-success">
                      <p className="font-bold text-foreground mb-2">{selectedBusiness.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {businessTypes.find(b => b.id === selectedBusiness.type)?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nível: {selectedBusiness.level}
                      </p>
                      <p className="text-sm text-success">
                        Renda: ${selectedBusiness.income}/dia
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-success">Você é o dono deste terreno!</p>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Construir Negócio</p>
                        <div className="space-y-2">
                          {businessTypes.map((type) => (
                            <Button
                              key={type.id}
                              variant={buildingType === type.id ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-between"
                              onClick={() => setBuildingType(type.id)}
                            >
                              <span>{type.name}</span>
                              <span className="text-xs">${type.cost}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {buildingType && (
                        <Button 
                          onClick={() => onBuildBusiness(selectedLot.id, buildingType)}
                          className="w-full"
                        >
                          Construir
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : selectedLot.ownerId ? (
                <div className="p-3 bg-destructive/10 rounded">
                  <p className="text-sm text-muted-foreground">
                    Propriedade de {selectedLot.ownerId}
                  </p>
                </div>
              ) : (
                <Button 
                  onClick={() => onBuyLot(selectedLot.id)}
                  className="w-full"
                  disabled={player.money < selectedLot.basePrice}
                >
                  Comprar Terreno
                </Button>
              )}

              <div className="pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Seus Terrenos</p>
                <p className="text-sm font-bold text-foreground">{playerLots.length}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Clique em um terreno no mapa para ver detalhes
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

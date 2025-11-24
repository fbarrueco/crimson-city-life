import { Business, Player, CityLot } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { businessTypes, employeeTypes, calculateBusinessIncome, getUpgradeCost } from "@/lib/cityMap";
import { Building2, TrendingUp, Users, Shield, Star, DollarSign, ArrowUp } from "lucide-react";
import { useState } from "react";

interface BusinessManagementSectionProps {
  player: Player;
  businesses: Business[];
  cityLots: CityLot[];
  onCollectIncome: (businessId: string) => void;
  onUpgradeBusiness: (businessId: string) => void;
  onHireEmployee: (businessId: string, employeeType: string) => void;
  onImproveStat: (businessId: string, stat: "security" | "quality") => void;
}

export function BusinessManagementSection({
  player,
  businesses,
  cityLots,
  onCollectIncome,
  onUpgradeBusiness,
  onHireEmployee,
  onImproveStat,
}: BusinessManagementSectionProps) {
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const playerBusinesses = businesses.filter(b => b.ownerId === player.name);

  if (playerBusinesses.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Meus Negócios
        </h2>
        <Card className="p-8 text-center border-border bg-card">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground mb-2">Você ainda não possui negócios</p>
          <p className="text-sm text-muted-foreground">
            Vá até a seção "Negócios" para comprar terrenos e construir seus empreendimentos!
          </p>
        </Card>
      </div>
    );
  }

  const selected = selectedBusiness || playerBusinesses[0];
  const selectedLot = cityLots.find(l => l.id === selected.lotId);
  const businessType = businessTypes.find(b => b.id === selected.type);
  const upgradeCost = getUpgradeCost(selected);
  const canUpgrade = selected.level < (businessType?.maxLevel || 10);
  const currentIncome = calculateBusinessIncome(selected, selectedLot!);

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Building2 className="h-6 w-6" />
        Gerenciar Negócios
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Lista de Negócios */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">Seus Negócios</h3>
          <div className="space-y-2">
            {playerBusinesses.map((business) => {
              const lot = cityLots.find(l => l.id === business.lotId);
              const income = calculateBusinessIncome(business, lot!);
              const isSelected = selected.id === business.id;

              return (
                <button
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className={`w-full p-3 rounded border text-left transition-all ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-foreground text-sm">{business.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {businessTypes.find(b => b.id === business.type)?.name} - Nível {business.level}
                      </p>
                    </div>
                    {business.accumulatedIncome > 0 && (
                      <Badge variant="default" className="text-xs">
                        +${business.accumulatedIncome}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Star className="h-3 w-3 text-warning" />
                    <span className="text-muted-foreground">{business.popularity}%</span>
                    <DollarSign className="h-3 w-3 text-success ml-2" />
                    <span className="text-success">${income}/h</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-1">Total de Negócios</p>
            <p className="text-2xl font-bold text-foreground">{playerBusinesses.length}</p>
          </div>
        </Card>

        {/* Detalhes e Ações */}
        <Card className="lg:col-span-2 p-4 border-border bg-card">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="upgrade">Melhorias</TabsTrigger>
              <TabsTrigger value="employees">Funcionários</TabsTrigger>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">{selected.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {businessType?.name} - Nível {selected.level}
                </p>
              </div>

              {selected.activeEvent && (
                <Card className="p-3 bg-warning/10 border-warning">
                  <p className="font-bold text-foreground text-sm mb-1">{selected.activeEvent.title}</p>
                  <p className="text-xs text-muted-foreground">{selected.activeEvent.description}</p>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-secondary rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="h-4 w-4 text-success" />
                    <p className="text-xs text-muted-foreground">Renda por Hora</p>
                  </div>
                  <p className="text-lg font-bold text-foreground">${currentIncome}</p>
                </div>

                <div className="p-3 bg-secondary rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="h-4 w-4 text-warning" />
                    <p className="text-xs text-muted-foreground">Popularidade</p>
                  </div>
                  <Progress value={selected.popularity} className="mb-1" />
                  <p className="text-sm font-bold text-foreground">{selected.popularity}%</p>
                </div>

                <div className="p-3 bg-secondary rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Segurança</p>
                  </div>
                  <Progress value={selected.security} className="mb-1" />
                  <p className="text-sm font-bold text-foreground">{selected.security}%</p>
                </div>

                <div className="p-3 bg-secondary rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-accent" />
                    <p className="text-xs text-muted-foreground">Qualidade</p>
                  </div>
                  <Progress value={selected.quality} className="mb-1" />
                  <p className="text-sm font-bold text-foreground">{selected.quality}%</p>
                </div>
              </div>

              <Card className="p-4 bg-success/10 border-success">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Renda Acumulada</p>
                    <p className="text-2xl font-bold text-foreground">${selected.accumulatedIncome}</p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => onCollectIncome(selected.id)}
                    disabled={selected.accumulatedIncome === 0}
                  >
                    Coletar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Última coleta: {new Date(selected.lastCollection).toLocaleTimeString()}
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="upgrade" className="space-y-4 mt-4">
              <Card className="p-4 border-border bg-secondary">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nível Atual</p>
                    <p className="text-3xl font-bold text-foreground">{selected.level}</p>
                  </div>
                  {canUpgrade && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Próximo Nível</p>
                      <p className="text-2xl font-bold text-primary">{selected.level + 1}</p>
                    </div>
                  )}
                </div>

                {canUpgrade ? (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Benefícios do Upgrade</p>
                      <div className="space-y-1 text-sm">
                        <p className="text-success">✓ +{Math.floor(businessType!.baseIncome * 0.5)} renda base</p>
                        <p className="text-success">✓ +5% eficiência geral</p>
                        <p className="text-success">✓ Novos upgrades desbloqueados</p>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => onUpgradeBusiness(selected.id)}
                      disabled={player.money < upgradeCost}
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      Fazer Upgrade - ${upgradeCost}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Nível máximo atingido!</p>
                  </div>
                )}
              </Card>

              <div className="space-y-3">
                <Card className="p-3 border-border bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-bold text-foreground text-sm">Melhorar Segurança</p>
                        <p className="text-xs text-muted-foreground">Reduz raids e roubos</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onImproveStat(selected.id, "security")}
                      disabled={player.money < 5000 || selected.security >= 100}
                    >
                      $5,000
                    </Button>
                  </div>
                </Card>

                <Card className="p-3 border-border bg-secondary">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-bold text-foreground text-sm">Melhorar Qualidade</p>
                        <p className="text-xs text-muted-foreground">Aumenta renda e popularidade</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onImproveStat(selected.id, "quality")}
                      disabled={player.money < 5000 || selected.quality >= 100}
                    >
                      $5,000
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="employees" className="space-y-4 mt-4">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Funcionários Atuais</h3>
                {selected.employees.length === 0 ? (
                  <Card className="p-4 text-center border-border bg-secondary">
                    <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground text-sm">Nenhum funcionário contratado</p>
                  </Card>
                ) : (
                  <div className="space-y-2 mb-4">
                    {selected.employees.map((emp) => (
                      <Card key={emp.id} className="p-3 border-border bg-secondary">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-foreground text-sm">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {employeeTypes.find(e => e.type === emp.type)?.name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-foreground">Skill: {emp.skill}</p>
                            <p className="text-xs text-muted-foreground">${emp.salary}/dia</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Contratar Funcionário</h3>
                <div className="space-y-2">
                  {employeeTypes.map((empType) => (
                    <Card key={empType.type} className="p-3 border-border bg-secondary">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-foreground text-sm">{empType.name}</p>
                          <p className="text-xs text-muted-foreground">{empType.effect}</p>
                          <p className="text-xs text-success mt-1">Salário: ${empType.baseSalary}/dia</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onHireEmployee(selected.id, empType.type)}
                          disabled={player.money < empType.baseSalary * 7}
                        >
                          Contratar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stats" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-border bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Funcionários</p>
                  <p className="text-2xl font-bold text-foreground">{selected.employees.length}</p>
                </Card>

                <Card className="p-4 border-border bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Renda Total</p>
                  <p className="text-2xl font-bold text-success">
                    ${Math.floor(selected.accumulatedIncome + (currentIncome * 24))}
                  </p>
                </Card>

                <Card className="p-4 border-border bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Eficiência</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.floor((selected.quality + selected.security + selected.popularity) / 3)}%
                  </p>
                </Card>

                <Card className="p-4 border-border bg-secondary">
                  <p className="text-sm text-muted-foreground mb-1">Tipo</p>
                  <p className="text-lg font-bold text-foreground">{businessType?.name}</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

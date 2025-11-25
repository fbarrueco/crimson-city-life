import { Player, DrugOrder } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { drugTypes } from "@/lib/gameLogic";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { ArrowDownUp, TrendingUp, TrendingDown, LineChart, DollarSign } from "lucide-react";
import { getOrderBook } from "@/lib/drugMarket";
import { Separator } from "../ui/separator";

interface EnhancedDrugsSectionProps {
  player: Player;
  allOrders: DrugOrder[];
  onPlaceOrder: (drugId: string, type: "buy" | "sell", orderType: "market" | "limit", quantity: number, price?: number) => void;
}

export function EnhancedDrugsSection({ player, allOrders, onPlaceOrder }: EnhancedDrugsSectionProps) {
  const [selectedDrug, setSelectedDrug] = useState(drugTypes[0].id);
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  const orderBook = getOrderBook(selectedDrug, allOrders);
  const drugType = drugTypes.find(d => d.id === selectedDrug);

  const handlePlaceOrder = (type: "buy" | "sell") => {
    const qty = parseInt(quantity);
    const price = orderType === "limit" ? parseFloat(limitPrice) : undefined;
    
    if (qty > 0) {
      onPlaceOrder(selectedDrug, type, orderType, qty, price);
      setQuantity("");
      setLimitPrice("");
    }
  };

  const playerDrug = player.drugs.find(d => d.id === selectedDrug);

  // Calcular spread (diferença entre melhor compra e melhor venda)
  const bestBid = orderBook.buyOrders[0]?.price || 0;
  const bestAsk = orderBook.sellOrders[0]?.price || drugType?.basePrice || 0;
  const spread = bestAsk - bestBid;
  const spreadPercent = bestBid > 0 ? ((spread / bestBid) * 100).toFixed(2) : "0";

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <LineChart className="h-7 w-7" />
        Exchange de Drogas
      </h2>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Seleção de Ativo */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Ativos</h3>
          <div className="space-y-1">
            {drugTypes.map((drug) => {
              const orders = getOrderBook(drug.id, allOrders);
              const hasActivity = orders.buyOrders.length > 0 || orders.sellOrders.length > 0;
              
              return (
                <button
                  key={drug.id}
                  onClick={() => setSelectedDrug(drug.id)}
                  className={`
                    w-full p-3 rounded text-left transition-all border
                    ${selectedDrug === drug.id 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm">{drug.name}</span>
                    {hasActivity && (
                      <Badge variant="outline" className="text-xs bg-success/20 text-success border-success">
                        Ativo
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">${drug.basePrice}/g</span>
                </button>
              );
            })}
          </div>

          {playerDrug && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary rounded">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Posição</p>
              <p className="text-xl font-bold text-foreground">{playerDrug.quantity}g</p>
              <p className="text-xs text-muted-foreground mt-1">
                ≈ ${(playerDrug.quantity * (bestBid || drugType?.basePrice || 0)).toFixed(0)}
              </p>
            </div>
          )}
        </Card>

        {/* Order Book Profissional */}
        <Card className="lg:col-span-2 p-4 border-border bg-card">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Livro de Ofertas - {drugType?.name}
              </h3>
              <div className="flex gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground">Spread: </span>
                  <span className="font-bold text-foreground">${spread.toFixed(2)} ({spreadPercent}%)</span>
                </div>
              </div>
            </div>
            
            {/* Header da Tabela */}
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide pb-2 border-b border-border">
              <div className="text-left">Preço ($/g)</div>
              <div className="text-center">Qtd (g)</div>
              <div className="text-right">Total ($)</div>
            </div>
          </div>

          <div className="space-y-1">
            {/* Ordens de Venda (Ask) - vermelho */}
            <div className="space-y-0.5">
              {orderBook.sellOrders.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-muted-foreground">Sem ofertas de venda</p>
                </div>
              ) : (
                orderBook.sellOrders.slice(0, 10).reverse().map((order, idx) => {
                  const total = (order.price || 0) * order.quantity;
                  const barWidth = (order.quantity / Math.max(...orderBook.sellOrders.map(o => o.quantity), 1)) * 100;
                  
                  return (
                    <div 
                      key={order.id}
                      className="relative grid grid-cols-3 gap-2 py-2 px-2 rounded hover:bg-destructive/5 transition-colors"
                    >
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-destructive/10 rounded"
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="relative text-sm font-mono font-bold text-destructive">${order.price?.toFixed(2)}</div>
                      <div className="relative text-sm font-mono text-center text-foreground">{order.quantity}</div>
                      <div className="relative text-sm font-mono text-right text-muted-foreground">${total.toFixed(0)}</div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Preço Atual / Spread */}
            <div className="py-3 my-2 bg-secondary/50 rounded border border-border">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Última Negociação</p>
                  <p className="text-2xl font-bold text-foreground font-mono">
                    ${((bestBid + bestAsk) / 2).toFixed(2)}
                  </p>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Preço Base</p>
                  <p className="text-lg font-semibold text-muted-foreground font-mono">
                    ${drugType?.basePrice}
                  </p>
                </div>
              </div>
            </div>

            {/* Ordens de Compra (Bid) - verde */}
            <div className="space-y-0.5">
              {orderBook.buyOrders.length === 0 ? (
                <div className="py-6 text-center">
                  <p className="text-xs text-muted-foreground">Sem ofertas de compra</p>
                </div>
              ) : (
                orderBook.buyOrders.slice(0, 10).map((order) => {
                  const total = (order.price || 0) * order.quantity;
                  const barWidth = (order.quantity / Math.max(...orderBook.buyOrders.map(o => o.quantity), 1)) * 100;
                  
                  return (
                    <div 
                      key={order.id}
                      className="relative grid grid-cols-3 gap-2 py-2 px-2 rounded hover:bg-success/5 transition-colors"
                    >
                      <div 
                        className="absolute right-0 top-0 bottom-0 bg-success/10 rounded"
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="relative text-sm font-mono font-bold text-success">${order.price?.toFixed(2)}</div>
                      <div className="relative text-sm font-mono text-center text-foreground">{order.quantity}</div>
                      <div className="relative text-sm font-mono text-right text-muted-foreground">${total.toFixed(0)}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Card>

        {/* Painel de Trading */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">Negociar</h3>
          
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="market" className="text-xs">Mercado</TabsTrigger>
              <TabsTrigger value="limit" className="text-xs">Limite</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-3 mt-0">
              <div className="p-2 bg-secondary/50 rounded text-xs text-muted-foreground">
                Execução imediata ao melhor preço
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Quantidade (g)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handlePlaceOrder("buy")} 
                  className="w-full bg-success hover:bg-success/90 text-white"
                  disabled={!quantity || parseInt(quantity) <= 0}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Comprar
                </Button>
                <Button 
                  onClick={() => handlePlaceOrder("sell")} 
                  className="w-full bg-destructive hover:bg-destructive/90 text-white"
                  disabled={!quantity || parseInt(quantity) <= 0}
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Vender
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="limit" className="space-y-3 mt-0">
              <div className="p-2 bg-secondary/50 rounded text-xs text-muted-foreground">
                Executa apenas ao preço definido
              </div>
              
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Quantidade (g)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Preço Limite ($/g)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={limitPrice}
                  onChange={(e) => setLimitPrice(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={() => handlePlaceOrder("buy")} 
                  className="w-full bg-success hover:bg-success/90 text-white"
                  disabled={!quantity || !limitPrice || parseInt(quantity) <= 0}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Comprar
                </Button>
                <Button 
                  onClick={() => handlePlaceOrder("sell")} 
                  className="w-full bg-destructive hover:bg-destructive/90 text-white"
                  disabled={!quantity || !limitPrice || parseInt(quantity) <= 0}
                >
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Vender
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Saldo Disponível</span>
              <span className="font-bold text-foreground font-mono">${player.money.toFixed(0)}</span>
            </div>
            {bestBid > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Melhor Compra</span>
                <span className="font-bold text-success font-mono">${bestBid.toFixed(2)}</span>
              </div>
            )}
            {bestAsk > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Melhor Venda</span>
                <span className="font-bold text-destructive font-mono">${bestAsk.toFixed(2)}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Player, DrugOrder } from "@/types/game";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { drugTypes } from "@/lib/gameLogic";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { ArrowDownUp, TrendingUp, TrendingDown } from "lucide-react";
import { getOrderBook } from "@/lib/drugMarket";

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

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
        <ArrowDownUp className="h-6 w-6" />
        Mercado de Drogas
      </h2>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seleção de Droga */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">Selecione a Droga</h3>
          <div className="space-y-2">
            {drugTypes.map((drug) => (
              <Button
                key={drug.id}
                variant={selectedDrug === drug.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedDrug(drug.id)}
              >
                {drug.name}
              </Button>
            ))}
          </div>

          {playerDrug && (
            <div className="mt-4 p-3 bg-secondary rounded">
              <p className="text-sm text-muted-foreground">Seu Estoque</p>
              <p className="text-lg font-bold text-foreground">{playerDrug.quantity}g</p>
            </div>
          )}
        </Card>

        {/* Order Book */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">Livro de Ordens</h3>
          <div className="space-y-4">
            {/* Ordens de Venda */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <p className="text-sm font-medium text-muted-foreground">Vendas</p>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {orderBook.sellOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma ordem de venda</p>
                ) : (
                  orderBook.sellOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between text-xs bg-destructive/10 p-2 rounded">
                      <span className="text-foreground">{order.quantity}g</span>
                      <span className="text-destructive font-bold">${order.price}/g</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Preço Base */}
            <div className="py-2 border-y border-border">
              <p className="text-center text-sm text-muted-foreground">
                Preço Base: <span className="font-bold text-foreground">${drugType?.basePrice}/g</span>
              </p>
            </div>

            {/* Ordens de Compra */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <p className="text-sm font-medium text-muted-foreground">Compras</p>
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {orderBook.buyOrders.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma ordem de compra</p>
                ) : (
                  orderBook.buyOrders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex justify-between text-xs bg-success/10 p-2 rounded">
                      <span className="text-foreground">{order.quantity}g</span>
                      <span className="text-success font-bold">${order.price}/g</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Criar Ordem */}
        <Card className="p-4 border-border bg-card">
          <h3 className="text-lg font-bold text-foreground mb-3">Criar Ordem</h3>
          
          <Tabs value={orderType} onValueChange={(v) => setOrderType(v as "market" | "limit")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="market">Mercado</TabsTrigger>
              <TabsTrigger value="limit">Limite</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Executada imediatamente ao melhor preço disponível
              </p>
              <Input
                type="number"
                placeholder="Quantidade (g)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-input border-border"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handlePlaceOrder("buy")} className="w-full">
                  Comprar
                </Button>
                <Button onClick={() => handlePlaceOrder("sell")} variant="outline" className="w-full">
                  Vender
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="limit" className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Só executa quando atingir o preço limite especificado
              </p>
              <Input
                type="number"
                placeholder="Quantidade (g)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="bg-input border-border"
              />
              <Input
                type="number"
                placeholder="Preço limite ($/g)"
                value={limitPrice}
                onChange={(e) => setLimitPrice(e.target.value)}
                className="bg-input border-border"
              />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => handlePlaceOrder("buy")} className="w-full">
                  Comprar
                </Button>
                <Button onClick={() => handlePlaceOrder("sell")} variant="outline" className="w-full">
                  Vender
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-4 p-3 bg-secondary/50 rounded">
            <p className="text-xs text-muted-foreground mb-1">Seu dinheiro</p>
            <p className="text-lg font-bold text-foreground">${player.money}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

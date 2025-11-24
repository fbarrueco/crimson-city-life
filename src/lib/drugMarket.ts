import { DrugOrder, DrugOrderBook, Player } from "@/types/game";
import { drugTypes } from "./gameLogic";

export function createDrugOrder(
  drugId: string,
  type: "buy" | "sell",
  orderType: "market" | "limit",
  quantity: number,
  price: number | undefined,
  player: Player
): DrugOrder {
  return {
    id: `order_${Date.now()}_${Math.random()}`,
    drugId,
    type,
    orderType,
    quantity,
    price,
    playerId: player.name,
    playerName: player.name,
    timestamp: Date.now(),
  };
}

export function getOrderBook(drugId: string, allOrders: DrugOrder[]): DrugOrderBook {
  const drugOrders = allOrders.filter(o => o.drugId === drugId);
  
  const buyOrders = drugOrders
    .filter(o => o.type === "buy")
    .sort((a, b) => (b.price || 0) - (a.price || 0));
  
  const sellOrders = drugOrders
    .filter(o => o.type === "sell")
    .sort((a, b) => (a.price || 0) - (b.price || 0));
  
  return {
    drugId,
    buyOrders,
    sellOrders,
  };
}

export function matchOrders(
  newOrder: DrugOrder,
  orderBook: DrugOrderBook,
  player: Player
): { 
  player: Player; 
  success: boolean; 
  message: string;
  matchedOrders: DrugOrder[];
  remainingOrder: DrugOrder | null;
} {
  const drugType = drugTypes.find(d => d.id === newOrder.drugId);
  if (!drugType) {
    return { 
      player, 
      success: false, 
      message: "Droga inválida!", 
      matchedOrders: [],
      remainingOrder: null
    };
  }

  let updatedPlayer = { ...player };
  const matchedOrders: DrugOrder[] = [];
  let remainingQuantity = newOrder.quantity;

  if (newOrder.type === "buy") {
    // Tentando comprar - verifica ordens de venda
    const availableSells = newOrder.orderType === "market" 
      ? orderBook.sellOrders
      : orderBook.sellOrders.filter(o => o.price && newOrder.price && o.price <= newOrder.price);

    for (const sellOrder of availableSells) {
      if (remainingQuantity <= 0) break;
      
      const matchQuantity = Math.min(remainingQuantity, sellOrder.quantity);
      const matchPrice = sellOrder.price || drugType.basePrice;
      const totalCost = matchQuantity * matchPrice;

      if (updatedPlayer.money >= totalCost) {
        updatedPlayer.money -= totalCost;
        
        const existingDrug = updatedPlayer.drugs.find(d => d.id === newOrder.drugId);
        if (existingDrug) {
          existingDrug.quantity += matchQuantity;
        } else {
          updatedPlayer.drugs.push({
            id: newOrder.drugId,
            name: drugType.name,
            quantity: matchQuantity,
            buyPrice: matchPrice,
            sellPrice: 0,
          });
        }

        matchedOrders.push({ ...sellOrder, quantity: matchQuantity });
        remainingQuantity -= matchQuantity;
      } else {
        break;
      }
    }
  } else {
    // Tentando vender - verifica ordens de compra
    const playerDrug = updatedPlayer.drugs.find(d => d.id === newOrder.drugId);
    if (!playerDrug || playerDrug.quantity < newOrder.quantity) {
      return { 
        player, 
        success: false, 
        message: "Quantidade insuficiente!", 
        matchedOrders: [],
        remainingOrder: null
      };
    }

    const availableBuys = newOrder.orderType === "market"
      ? orderBook.buyOrders
      : orderBook.buyOrders.filter(o => o.price && newOrder.price && o.price >= newOrder.price);

    for (const buyOrder of availableBuys) {
      if (remainingQuantity <= 0) break;
      
      const matchQuantity = Math.min(remainingQuantity, buyOrder.quantity);
      const matchPrice = buyOrder.price || drugType.basePrice;
      const totalEarned = matchQuantity * matchPrice;

      updatedPlayer.money += totalEarned;
      playerDrug.quantity -= matchQuantity;

      matchedOrders.push({ ...buyOrder, quantity: matchQuantity });
      remainingQuantity -= matchQuantity;
    }

    if (playerDrug.quantity === 0) {
      updatedPlayer.drugs = updatedPlayer.drugs.filter(d => d.id !== newOrder.drugId);
    }
  }

  const remainingOrder = remainingQuantity > 0 
    ? { ...newOrder, quantity: remainingQuantity }
    : null;

  if (matchedOrders.length > 0) {
    const totalMatched = newOrder.quantity - remainingQuantity;
    return {
      player: updatedPlayer,
      success: true,
      message: `Executado ${totalMatched}g! ${remainingOrder ? `${remainingQuantity}g na fila.` : ""}`,
      matchedOrders,
      remainingOrder,
    };
  }

  return {
    player: updatedPlayer,
    success: false,
    message: "Nenhuma ordem correspondente encontrada!",
    matchedOrders: [],
    remainingOrder,
  };
}

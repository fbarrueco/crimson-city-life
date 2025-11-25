import { DrugOrder, DrugOrderBook, Player, DrugTransaction } from "@/types/game";
import { drugTypes } from "./gameLogic";

// Constantes de proteção anti-exploit
const MIN_SPREAD_PERCENT = 3; // Spread mínimo de 3%
const MAX_ORDER_SIZE = 1000; // Máximo de 1000g por ordem
const MAX_ORDERS_PER_MINUTE = 10; // Máximo de 10 ordens por minuto
const LIQUIDITY_SLIPPAGE = 0.02; // 2% de slippage para grandes ordens

// Armazena timestamps das últimas ordens por jogador (em memória)
const playerOrderHistory: Map<string, number[]> = new Map();

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

// Calcula preço médio das últimas N transações
function getAveragePrice(drugId: string, transactions: DrugTransaction[], lastN: number): number {
  const drugTransactions = transactions
    .filter(t => t.drugId === drugId)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, lastN);
  
  if (drugTransactions.length === 0) {
    const drugType = drugTypes.find(d => d.id === drugId);
    return drugType?.basePrice || 100;
  }
  
  const sum = drugTransactions.reduce((acc, t) => acc + t.price, 0);
  return sum / drugTransactions.length;
}

// Validações anti-exploit
function validateOrder(
  player: Player,
  quantity: number,
  type: "buy" | "sell",
  drugId: string
): { valid: boolean; message: string } {
  // Validar quantidade máxima
  if (quantity <= 0) {
    return { valid: false, message: "Quantidade inválida!" };
  }
  
  if (quantity > MAX_ORDER_SIZE) {
    return { valid: false, message: `Quantidade máxima: ${MAX_ORDER_SIZE}g por ordem!` };
  }
  
  // Validar rate limiting
  const now = Date.now();
  const playerOrders = playerOrderHistory.get(player.name) || [];
  const recentOrders = playerOrders.filter(timestamp => now - timestamp < 60000);
  
  if (recentOrders.length >= MAX_ORDERS_PER_MINUTE) {
    return { valid: false, message: "Muitas ordens! Aguarde um momento." };
  }
  
  // Atualizar histórico
  recentOrders.push(now);
  playerOrderHistory.set(player.name, recentOrders);
  
  // Validar inventário para vendas
  if (type === "sell") {
    const playerDrug = player.drugs.find(d => d.id === drugId);
    if (!playerDrug || playerDrug.quantity < quantity) {
      return { valid: false, message: "Quantidade insuficiente em estoque!" };
    }
  }
  
  return { valid: true, message: "" };
}

// Aplica slippage baseado no tamanho da ordem
function applySlippage(basePrice: number, quantity: number, isBuying: boolean): number {
  const slippageFactor = Math.min(quantity / MAX_ORDER_SIZE, 1) * LIQUIDITY_SLIPPAGE;
  return isBuying 
    ? basePrice * (1 + slippageFactor) 
    : basePrice * (1 - slippageFactor);
}

export function matchOrders(
  newOrder: DrugOrder,
  orderBook: DrugOrderBook,
  player: Player,
  allTransactions: DrugTransaction[]
): { 
  player: Player; 
  success: boolean; 
  message: string;
  matchedOrders: DrugOrder[];
  remainingOrder: DrugOrder | null;
  newTransactions: DrugTransaction[];
} {
  const drugType = drugTypes.find(d => d.id === newOrder.drugId);
  if (!drugType) {
    return { 
      player, 
      success: false, 
      message: "Droga inválida!", 
      matchedOrders: [],
      remainingOrder: null,
      newTransactions: [],
    };
  }

  // Validações anti-exploit
  const validation = validateOrder(player, newOrder.quantity, newOrder.type, newOrder.drugId);
  if (!validation.valid) {
    return {
      player,
      success: false,
      message: validation.message,
      matchedOrders: [],
      remainingOrder: null,
      newTransactions: [],
    };
  }

  let updatedPlayer = { ...player };
  const matchedOrders: DrugOrder[] = [];
  const newTransactions: DrugTransaction[] = [];
  let remainingQuantity = newOrder.quantity;

  if (newOrder.type === "buy") {
    // COMPRAR
    if (newOrder.orderType === "market") {
      // Ordem a mercado: Primeiro tenta match com players, depois usa liquidez do jogo
      const availableSells = orderBook.sellOrders;
      
      // Fase 1: Match com ordens de players
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
          newTransactions.push({
            id: `tx_${Date.now()}_${Math.random()}`,
            drugId: newOrder.drugId,
            quantity: matchQuantity,
            price: matchPrice,
            timestamp: Date.now(),
            buyerId: player.name,
            sellerId: sellOrder.playerId,
          });
          
          remainingQuantity -= matchQuantity;
        } else {
          break;
        }
      }
      
      // Fase 2: Liquidez do jogo para quantidade restante
      if (remainingQuantity > 0 && updatedPlayer.money > 0) {
        // Preço = média das últimas 3 transações + slippage
        const avgPrice = getAveragePrice(newOrder.drugId, allTransactions, 3);
        const gamePrice = applySlippage(avgPrice, remainingQuantity, true);
        
        // Spread mínimo de proteção
        const minSpread = avgPrice * (MIN_SPREAD_PERCENT / 100);
        const finalPrice = Math.max(gamePrice, avgPrice + minSpread);
        
        const affordableQuantity = Math.floor(updatedPlayer.money / finalPrice);
        const executeQuantity = Math.min(remainingQuantity, affordableQuantity);
        
        if (executeQuantity > 0) {
          const totalCost = executeQuantity * finalPrice;
          updatedPlayer.money -= totalCost;
          
          const existingDrug = updatedPlayer.drugs.find(d => d.id === newOrder.drugId);
          if (existingDrug) {
            existingDrug.quantity += executeQuantity;
          } else {
            updatedPlayer.drugs.push({
              id: newOrder.drugId,
              name: drugType.name,
              quantity: executeQuantity,
              buyPrice: finalPrice,
              sellPrice: 0,
            });
          }
          
          newTransactions.push({
            id: `tx_${Date.now()}_${Math.random()}`,
            drugId: newOrder.drugId,
            quantity: executeQuantity,
            price: finalPrice,
            timestamp: Date.now(),
            buyerId: player.name,
            sellerId: "GAME_LIQUIDITY",
          });
          
          remainingQuantity -= executeQuantity;
        }
      }
    } else {
      // Ordem limite: Só executa com players
      const availableSells = orderBook.sellOrders.filter(
        o => o.price && newOrder.price && o.price <= newOrder.price
      );

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
          newTransactions.push({
            id: `tx_${Date.now()}_${Math.random()}`,
            drugId: newOrder.drugId,
            quantity: matchQuantity,
            price: matchPrice,
            timestamp: Date.now(),
            buyerId: player.name,
            sellerId: sellOrder.playerId,
          });
          
          remainingQuantity -= matchQuantity;
        } else {
          break;
        }
      }
    }
  } else {
    // VENDER
    const playerDrug = updatedPlayer.drugs.find(d => d.id === newOrder.drugId);
    if (!playerDrug || playerDrug.quantity < newOrder.quantity) {
      return { 
        player, 
        success: false, 
        message: "Quantidade insuficiente!", 
        matchedOrders: [],
        remainingOrder: null,
        newTransactions: [],
      };
    }

    if (newOrder.orderType === "market") {
      // Ordem a mercado: Primeiro tenta match com players, depois usa liquidez do jogo
      const availableBuys = orderBook.buyOrders;

      // Fase 1: Match com ordens de players
      for (const buyOrder of availableBuys) {
        if (remainingQuantity <= 0) break;
        
        const matchQuantity = Math.min(remainingQuantity, buyOrder.quantity);
        const matchPrice = buyOrder.price || drugType.basePrice;
        const totalEarned = matchQuantity * matchPrice;

        updatedPlayer.money += totalEarned;
        playerDrug.quantity -= matchQuantity;

        matchedOrders.push({ ...buyOrder, quantity: matchQuantity });
        newTransactions.push({
          id: `tx_${Date.now()}_${Math.random()}`,
          drugId: newOrder.drugId,
          quantity: matchQuantity,
          price: matchPrice,
          timestamp: Date.now(),
          buyerId: buyOrder.playerId,
          sellerId: player.name,
        });
        
        remainingQuantity -= matchQuantity;
      }

      // Fase 2: Liquidez do jogo para quantidade restante
      if (remainingQuantity > 0) {
        // Preço = média das últimas 10 transações - slippage
        const avgPrice = getAveragePrice(newOrder.drugId, allTransactions, 10);
        const gamePrice = applySlippage(avgPrice, remainingQuantity, false);
        
        // Spread mínimo de proteção
        const minSpread = avgPrice * (MIN_SPREAD_PERCENT / 100);
        const finalPrice = Math.min(gamePrice, avgPrice - minSpread);
        
        // Proteção: preço mínimo é 50% do preço base
        const minPrice = drugType.basePrice * 0.5;
        const safePrice = Math.max(finalPrice, minPrice);
        
        const totalEarned = remainingQuantity * safePrice;
        updatedPlayer.money += totalEarned;
        playerDrug.quantity -= remainingQuantity;
        
        newTransactions.push({
          id: `tx_${Date.now()}_${Math.random()}`,
          drugId: newOrder.drugId,
          quantity: remainingQuantity,
          price: safePrice,
          timestamp: Date.now(),
          buyerId: "GAME_LIQUIDITY",
          sellerId: player.name,
        });
        
        remainingQuantity = 0;
      }

      if (playerDrug.quantity === 0) {
        updatedPlayer.drugs = updatedPlayer.drugs.filter(d => d.id !== newOrder.drugId);
      }
    } else {
      // Ordem limite: Só executa com players
      const availableBuys = orderBook.buyOrders.filter(
        o => o.price && newOrder.price && o.price >= newOrder.price
      );

      for (const buyOrder of availableBuys) {
        if (remainingQuantity <= 0) break;
        
        const matchQuantity = Math.min(remainingQuantity, buyOrder.quantity);
        const matchPrice = buyOrder.price || drugType.basePrice;
        const totalEarned = matchQuantity * matchPrice;

        updatedPlayer.money += totalEarned;
        playerDrug.quantity -= matchQuantity;

        matchedOrders.push({ ...buyOrder, quantity: matchQuantity });
        newTransactions.push({
          id: `tx_${Date.now()}_${Math.random()}`,
          drugId: newOrder.drugId,
          quantity: matchQuantity,
          price: matchPrice,
          timestamp: Date.now(),
          buyerId: buyOrder.playerId,
          sellerId: player.name,
        });
        
        remainingQuantity -= matchQuantity;
      }

      if (playerDrug.quantity === 0 && remainingQuantity === 0) {
        updatedPlayer.drugs = updatedPlayer.drugs.filter(d => d.id !== newOrder.drugId);
      }
    }
  }

  const remainingOrder = remainingQuantity > 0 && newOrder.orderType === "limit"
    ? { ...newOrder, quantity: remainingQuantity }
    : null;

  const totalExecuted = newOrder.quantity - remainingQuantity;
  
  if (totalExecuted > 0) {
    const avgExecutionPrice = newTransactions.reduce((sum, tx) => sum + tx.price, 0) / newTransactions.length;
    return {
      player: updatedPlayer,
      success: true,
      message: `Executado ${totalExecuted}g a $${avgExecutionPrice.toFixed(2)}/g! ${remainingOrder ? `${remainingQuantity}g na fila.` : ""}`,
      matchedOrders,
      remainingOrder,
      newTransactions,
    };
  }

  return {
    player: updatedPlayer,
    success: false,
    message: newOrder.orderType === "limit" ? "Ordem limite adicionada ao book!" : "Sem liquidez suficiente!",
    matchedOrders: [],
    remainingOrder: newOrder.orderType === "limit" ? newOrder : null,
    newTransactions: [],
  };
}

// Limpar transações antigas (manter apenas últimas 100 por droga)
export function cleanOldTransactions(transactions: DrugTransaction[]): DrugTransaction[] {
  const byDrug = new Map<string, DrugTransaction[]>();
  
  transactions.forEach(tx => {
    if (!byDrug.has(tx.drugId)) {
      byDrug.set(tx.drugId, []);
    }
    byDrug.get(tx.drugId)!.push(tx);
  });
  
  const cleaned: DrugTransaction[] = [];
  byDrug.forEach(drugTxs => {
    const sorted = drugTxs.sort((a, b) => b.timestamp - a.timestamp);
    cleaned.push(...sorted.slice(0, 100));
  });
  
  return cleaned;
}

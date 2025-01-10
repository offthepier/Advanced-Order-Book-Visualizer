import { Order, Trade } from '../types';

export class OrderMatcher {
  private buyOrders: Order[] = [];
  private sellOrders: Order[] = [];
  private trades: Trade[] = [];

  addOrder(order: Order): Trade[] {
    const newTrades: Trade[] = [];
    const oppositeOrders = order.side === 'buy' ? this.sellOrders : this.buyOrders;
    const sameOrders = order.side === 'buy' ? this.buyOrders : this.sellOrders;
    let remainingQuantity = order.quantity;

    while (remainingQuantity > 0 && oppositeOrders.length > 0) {
      const matchingOrder = oppositeOrders[0];
      if ((order.side === 'buy' && order.price < matchingOrder.price) ||
          (order.side === 'sell' && order.price > matchingOrder.price)) {
        break;
      }

      const tradeQuantity = Math.min(remainingQuantity, matchingOrder.quantity);
      const trade: Trade = {
        id: Math.random().toString(36).substr(2, 9),
        buyOrderId: order.side === 'buy' ? order.id : matchingOrder.id,
        sellOrderId: order.side === 'sell' ? order.id : matchingOrder.id,
        price: matchingOrder.price,
        quantity: tradeQuantity,
        timestamp: Date.now()
      };

      newTrades.push(trade);
      this.trades.push(trade);

      remainingQuantity -= tradeQuantity;
      matchingOrder.quantity -= tradeQuantity;

      if (matchingOrder.quantity === 0) {
        oppositeOrders.shift();
      }
    }

    if (remainingQuantity > 0) {
      const remainingOrder = { ...order, quantity: remainingQuantity };
      sameOrders.push(remainingOrder);
      sameOrders.sort((a, b) => order.side === 'buy' ? b.price - a.price : a.price - b.price);
    }

    return newTrades;
  }

  getMarketDepth(levels: number = 10): { bids: [number, number][], asks: [number, number][] } {
    const bids: Map<number, number> = new Map();
    const asks: Map<number, number> = new Map();

    this.buyOrders.forEach(order => {
      bids.set(order.price, (bids.get(order.price) || 0) + order.quantity);
    });

    this.sellOrders.forEach(order => {
      asks.set(order.price, (asks.get(order.price) || 0) + order.quantity);
    });

    return {
      bids: Array.from(bids.entries())
        .sort((a, b) => b[0] - a[0])
        .slice(0, levels),
      asks: Array.from(asks.entries())
        .sort((a, b) => a[0] - b[0])
        .slice(0, levels)
    };
  }

  calculateVWAP(): number {
    const trades = this.trades.filter(t => 
      t.timestamp > Date.now() - 24 * 60 * 60 * 1000
    );
    
    if (trades.length === 0) return 0;

    const totalVolume = trades.reduce((sum, trade) => sum + trade.quantity, 0);
    const weightedSum = trades.reduce((sum, trade) => 
      sum + (trade.price * trade.quantity), 0
    );

    return weightedSum / totalVolume;
  }

  getOrderBookImbalance(): number {
    const totalBuyVolume = this.buyOrders.reduce((sum, order) => 
      sum + order.quantity, 0
    );
    const totalSellVolume = this.sellOrders.reduce((sum, order) => 
      sum + order.quantity, 0
    );

    if (totalBuyVolume + totalSellVolume === 0) return 0;
    return (totalBuyVolume - totalSellVolume) / (totalBuyVolume + totalSellVolume);
  }
}
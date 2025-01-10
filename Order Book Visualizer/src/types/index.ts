export interface Order {
  id: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  timestamp: number;
}

export interface MarketDepth {
  price: number;
  cumulativeVolume: number;
  side: 'buy' | 'sell';
}

export interface PricePoint {
  timestamp: number;
  price: number;
  volume: number;
}
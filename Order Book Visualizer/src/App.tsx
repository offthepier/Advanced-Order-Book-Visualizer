import React, { useState, useCallback } from 'react';
import { TrendingUp, Plus, Activity } from 'lucide-react';
import { OrderBook } from './dataStructures/AVLTree';
import { OrderBookVisualization } from './components/OrderBookVisualization';
import { MarketDepthChart } from './components/MarketDepthChart';
import { PriceChart } from './components/PriceChart';
import { Analytics } from './components/Analytics';
import { OrderMatcher } from './dataStructures/OrderMatcher';
import { Order, PricePoint, MarketDepth } from './types';

const orderBook = new OrderBook();
const orderMatcher = new OrderMatcher();

function App() {
  const [treeData, setTreeData] = useState({ nodes: [], links: [] });
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [marketDepth, setMarketDepth] = useState<MarketDepth[]>([]);

  const handleAddOrder = useCallback(() => {
    if (!price || !quantity) return;

    const order: Order = {
      id: Math.random().toString(36).substr(2, 9),
      price: parseFloat(price),
      quantity: parseInt(quantity),
      side,
      timestamp: Date.now()
    };

    // Add to order book visualization
    orderBook.addOrder(order);
    setTreeData(orderBook.toVisualizationData());

    // Process order matching
    const trades = orderMatcher.addOrder(order);

    // Update price history
    if (trades.length > 0) {
      const newPricePoint: PricePoint = {
        timestamp: Date.now(),
        price: trades[trades.length - 1].price,
        volume: trades.reduce((sum, t) => sum + t.quantity, 0)
      };
      setPriceHistory(prev => [...prev, newPricePoint]);
    }

    // Update market depth
    const depth = orderMatcher.getMarketDepth();
    const depthData: MarketDepth[] = [
      ...depth.bids.map(([price, volume]) => ({
        price,
        cumulativeVolume: volume,
        side: 'buy' as const
      })),
      ...depth.asks.map(([price, volume]) => ({
        price,
        cumulativeVolume: volume,
        side: 'sell' as const
      }))
    ];
    setMarketDepth(depthData);

    setPrice('');
    setQuantity('');
  }, [price, quantity, side]);

  const addRandomOrder = useCallback(() => {
    const randomOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      price: Math.floor(Math.random() * 1000) + 100,
      quantity: Math.floor(Math.random() * 100) + 1,
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      timestamp: Date.now()
    };

    orderBook.addOrder(randomOrder);
    setTreeData(orderBook.toVisualizationData());
    orderMatcher.addOrder(randomOrder);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Advanced Order Book Visualizer
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Enter quantity"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Side</label>
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>
              <div className="flex items-end space-x-2">
                <button
                  onClick={handleAddOrder}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Order
                </button>
                <button
                  onClick={addRandomOrder}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Activity className="h-5 w-5 mr-2" />
                  Random Order
                </button>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <Analytics orderMatcher={orderMatcher} />

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MarketDepthChart data={marketDepth} />
            <PriceChart data={priceHistory} />
          </div>

          {/* Tree Visualization */}
          <div className="bg-white rounded-lg shadow-md p-6 h-[600px]">
            <h3 className="text-lg font-semibold mb-4">Order Book Tree Structure</h3>
            <OrderBookVisualization data={treeData} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
import React from 'react';
import { OrderMatcher } from '../dataStructures/OrderMatcher';

interface AnalyticsProps {
  orderMatcher: OrderMatcher;
}

export const Analytics: React.FC<AnalyticsProps> = ({ orderMatcher }) => {
  const vwap = orderMatcher.calculateVWAP();
  const imbalance = orderMatcher.getOrderBookImbalance();

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">VWAP (24h)</h3>
        <p className="text-2xl font-bold text-blue-600">
          ${vwap.toFixed(2)}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-semibold mb-2">Order Book Imbalance</h3>
        <p className={`text-2xl font-bold ${
          imbalance > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {(imbalance * 100).toFixed(2)}%
        </p>
      </div>
    </div>
  );
};
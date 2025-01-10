import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { MarketDepth } from '../types';

interface MarketDepthChartProps {
  data: MarketDepth[];
}

export const MarketDepthChart: React.FC<MarketDepthChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.price) || 0,
        d3.max(data, d => d.price) || 0
      ])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.cumulativeVolume) || 0])
      .range([height, 0]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y));

    // Separate buy and sell orders
    const buyOrders = data.filter(d => d.side === 'buy');
    const sellOrders = data.filter(d => d.side === 'sell');

    // Create area generators
    const areaGenerator = d3.area<MarketDepth>()
      .x(d => x(d.price))
      .y0(height)
      .y1(d => y(d.cumulativeVolume));

    // Add buy orders area
    svg.append('path')
      .datum(buyOrders)
      .attr('fill', 'rgba(76, 175, 80, 0.3)')
      .attr('d', areaGenerator);

    // Add sell orders area
    svg.append('path')
      .datum(sellOrders)
      .attr('fill', 'rgba(244, 67, 54, 0.3)')
      .attr('d', areaGenerator);

  }, [data]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Market Depth</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};
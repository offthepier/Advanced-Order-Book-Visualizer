import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { PricePoint } from '../types';

interface PriceChartProps {
  data: PricePoint[];
}

export const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
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

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([
        d3.min(data, d => d.price) || 0,
        d3.max(data, d => d.price) || 0
      ])
      .range([height, 0]);

    // Add X axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    svg.append('g')
      .call(d3.axisLeft(y));

    // Add price line
    const line = d3.line<PricePoint>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.price));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#2196F3')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Add volume bars
    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume) || 0])
      .range([0, height / 4]);

    svg.selectAll('.volume-bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'volume-bar')
      .attr('x', d => x(new Date(d.timestamp)) - 2)
      .attr('y', d => height - volumeScale(d.volume))
      .attr('width', 4)
      .attr('height', d => volumeScale(d.volume))
      .attr('fill', 'rgba(33, 150, 243, 0.3)');

  }, [data]);

  return (
    <div className="w-full h-full bg-white rounded-lg shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4">Price History</h3>
      <svg ref={svgRef}></svg>
    </div>
  );
};
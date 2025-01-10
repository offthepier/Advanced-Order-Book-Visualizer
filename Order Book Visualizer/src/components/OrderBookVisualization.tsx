import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface VisualizationProps {
  data: {
    nodes: any[];
    links: any[];
  };
}

export const OrderBookVisualization: React.FC<VisualizationProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create force simulation
    const simulation = d3.forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Draw links
    const links = svg.append("g")
      .selectAll("line")
      .data(data.links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Draw nodes
    const nodes = svg.append("g")
      .selectAll("g")
      .data(data.nodes)
      .enter()
      .append("g");

    // Node circles
    nodes.append("circle")
      .attr("r", (d: any) => Math.min(30 + d.orders.length * 2, 50))
      .attr("fill", (d: any) => {
        const buyOrders = d.orders.filter((o: any) => o.side === 'buy').length;
        const sellOrders = d.orders.length - buyOrders;
        if (buyOrders > sellOrders) return "#4CAF50";
        if (sellOrders > buyOrders) return "#F44336";
        return "#9E9E9E";
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Price labels
    nodes.append("text")
      .text((d: any) => `$${d.price}`)
      .attr("text-anchor", "middle")
      .attr("dy", "-1.5em")
      .attr("fill", "#333")
      .attr("font-weight", "bold");

    // Order count labels
    nodes.append("text")
      .text((d: any) => d.orders.length)
      .attr("text-anchor", "middle")
      .attr("dy", "0.4em")
      .attr("fill", "#fff")
      .attr("font-weight", "bold");

    // Update positions on simulation tick
    simulation.on("tick", () => {
      links
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      nodes.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Add zoom capabilities
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform);
      });

    d3.select(svgRef.current)
      .call(zoom as any);

  }, [data]);

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden bg-white shadow-lg">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
};
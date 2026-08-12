'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { NetworkRequest } from '@/types/network';
import { formatBytes, formatDuration } from '@/lib/format';
import { useAnalysisStore } from '@/store/analysis-store';

interface WaterfallProps {
  requests: NetworkRequest[];
  totalDuration: number;
}

export const Waterfall: React.FC<WaterfallProps> = ({ requests, totalDuration }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const { selectedRequestId, setSelectedRequestId } = useAnalysisStore();

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (!svgRef.current || requests.length === 0) return;

    const margin = { top: 30, right: 20, bottom: 20, left: 240 };
    const width = Math.max(500, containerWidth - margin.left - margin.right);
    const rowHeight = 28;
    const height = requests.length * rowHeight;

    const maxTime = Math.max(totalDuration, d3.max(requests, (d) => d.endTime) || 1000);

    const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, width]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.attr('width', containerWidth).attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add Timeline Axis Ticks
    const xAxis = d3
      .axisTop(xScale)
      .ticks(6)
      .tickFormat((d: d3.NumberValue) => `${d} ms`);

    const axisG = g.append('g').call(xAxis);
    axisG.selectAll('text').attr('fill', '#94a3b8').style('font-family', 'JetBrains Mono, monospace').style('font-size', '10px');
    axisG.selectAll('line').attr('stroke', '#334155');
    axisG.select('.domain').attr('stroke', '#334155');

    // Add Grid Lines
    g.selectAll('.grid-line')
      .data(xScale.ticks(6))
      .enter()
      .append('line')
      .attr('x1', (d: number) => xScale(d))
      .attr('x2', (d: number) => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#1e293b')
      .attr('stroke-dasharray', '2,2');

    // Color map for resource types
    const getColor = (type: string, failed?: boolean) => {
      if (failed) return '#f43f5e';
      switch (type) {
        case 'document':
          return '#38bdf8';
        case 'script':
          return '#f59e0b';
        case 'stylesheet':
          return '#a855f7';
        case 'image':
          return '#22c55e';
        case 'font':
          return '#818cf8';
        case 'xhr':
        case 'fetch':
          return '#fb7185';
        default:
          return '#64748b';
      }
    };

    // Render Row Backgrounds & Bar Elements
    requests.forEach((req, idx) => {
      const y = idx * rowHeight;
      const startX = xScale(req.startTime);
      const barWidth = Math.max(3, xScale(req.endTime) - startX);
      const isSelected = req.id === selectedRequestId;

      // Row background highlight
      const rowBg = g
        .append('rect')
        .attr('x', -margin.left)
        .attr('y', y)
        .attr('width', containerWidth)
        .attr('height', rowHeight - 2)
        .attr('fill', isSelected ? '#1e293b' : idx % 2 === 0 ? '#0f172a' : '#0b1120')
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedRequestId(req.id));

      rowBg
        .on('mouseover', (_event: MouseEvent, _d: unknown) => {
          if (!isSelected) rowBg.attr('fill', '#1e293b');
        })
        .on('mouseout', (_event: MouseEvent, _d: unknown) => {
          if (!isSelected) rowBg.attr('fill', idx % 2 === 0 ? '#0f172a' : '#0b1120');
        });

      // Label column (Name + Type)
      const urlFileName = req.url.split('/').pop()?.split('?')[0] || req.url;
      const displayName = urlFileName.length > 26 ? `${urlFileName.substring(0, 24)}...` : urlFileName;

      // Status indicator dot
      g.append('circle')
        .attr('cx', -margin.left + 12)
        .attr('cy', y + 13)
        .attr('r', 3.5)
        .attr('fill', getColor(req.resourceType, req.failed));

      g.append('text')
        .attr('x', -margin.left + 24)
        .attr('y', y + 16)
        .attr('fill', req.failed ? '#f43f5e' : '#f1f5f9')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '11px')
        .style('cursor', 'pointer')
        .text(displayName)
        .on('click', () => setSelectedRequestId(req.id));

      // Resource bar
      g.append('rect')
        .attr('x', startX)
        .attr('y', y + 6)
        .attr('width', barWidth)
        .attr('height', 14)
        .attr('rx', 3)
        .attr('fill', getColor(req.resourceType, req.failed))
        .attr('opacity', 0.85)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedRequestId(req.id));

      // Duration text right next to bar
      g.append('text')
        .attr('x', startX + barWidth + 6)
        .attr('y', y + 16)
        .attr('fill', '#94a3b8')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '10px')
        .text(formatDuration(req.duration));
    });
  }, [requests, totalDuration, containerWidth, selectedRequestId, setSelectedRequestId]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-mono text-sm font-bold text-slate-100 uppercase tracking-wider">
            Network Waterfall Timeline (D3 Gantt Chart)
          </h3>
          <p className="text-[11px] font-mono text-slate-400">
            Click any request row to inspect raw HTTP headers and payload breakdown.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-sky-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-400" /> HTML
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> JS
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-purple-400" /> CSS
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Image
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-400" /> API / XHR
          </span>
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-x-auto">
        <svg ref={svgRef} className="w-full" />
      </div>
    </div>
  );
};

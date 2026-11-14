"use client";

import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { NetworkRequest } from "@/types/network";
import { formatDuration } from "@/lib/format";
import { useAnalysisStore } from "@/store/analysis-store";

interface WaterfallProps {
  requests: NetworkRequest[];
  totalDuration: number;
}

export const Waterfall: React.FC<WaterfallProps> = ({
  requests,
  totalDuration,
}) => {
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
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!svgRef.current || requests.length === 0) return;

    const margin = { top: 30, right: 20, bottom: 20, left: 240 };
    const width = Math.max(500, containerWidth - margin.left - margin.right);
    const rowHeight = 28;
    const height = requests.length * rowHeight;

    const maxTime = Math.max(
      totalDuration,
      d3.max(requests, (d) => d.endTime) || 1000,
    );

    const xScale = d3.scaleLinear().domain([0, maxTime]).range([0, width]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add Timeline Axis Ticks
    const xAxis = d3
      .axisTop(xScale)
      .ticks(6)
      .tickFormat((d: d3.NumberValue) => `${d} ms`);

    const axisG = g.append("g").call(xAxis);
    axisG
      .selectAll("text")
      .attr("fill", "#c5c1b4")
      .style("font-family", "JetBrains Mono, monospace")
      .style("font-size", "10px");
    axisG.selectAll("line").attr("stroke", "#555247");
    axisG.select(".domain").attr("stroke", "#555247");

    // Add Grid Lines
    g.selectAll(".grid-line")
      .data(xScale.ticks(6))
      .enter()
      .append("line")
      .attr("x1", (d: number) => xScale(d))
      .attr("x2", (d: number) => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#36362f")
      .attr("stroke-dasharray", "2,2");

    // Color map for resource types
    const getColor = (type: string, failed?: boolean) => {
      if (failed) return "#e11d48";
      switch (type) {
        case "document":
          return "#0284c7";
        case "script":
          return "#d97706";
        case "stylesheet":
          return "#9333ea";
        case "image":
          return "#16a34a";
        case "font":
          return "#4f46e5";
        case "xhr":
        case "fetch":
          return "#e11d48";
        default:
          return "#aaa69c";
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
        .append("rect")
        .attr("x", -margin.left)
        .attr("y", y)
        .attr("width", width + margin.left + margin.right)
        .attr("height", rowHeight - 2)
        .attr(
          "fill",
          isSelected ? "#4b4939" : idx % 2 === 0 ? "#252525" : "#2e2e28",
        )
        .attr("rx", 4)
        .style("cursor", "pointer")
        .on("click", () => setSelectedRequestId(req.id));

      rowBg
        .on("mouseover", (_event: MouseEvent, _d: unknown) => {
          if (!isSelected) rowBg.attr("fill", "#36362f");
        })
        .on("mouseout", (_event: MouseEvent, _d: unknown) => {
          if (!isSelected)
            rowBg.attr("fill", idx % 2 === 0 ? "#252525" : "#2e2e28");
        });

      // Label column (Name + Type)
      const urlFileName = req.url.split("/").pop()?.split("?")[0] || req.url;
      const displayName =
        urlFileName.length > 26
          ? `${urlFileName.substring(0, 24)}...`
          : urlFileName;

      // Status indicator dot
      g.append("circle")
        .attr("cx", -margin.left + 12)
        .attr("cy", y + 13)
        .attr("r", 3.5)
        .attr("fill", getColor(req.resourceType, req.failed));

      g.append("text")
        .attr("x", -margin.left + 24)
        .attr("y", y + 16)
        .attr("fill", req.failed ? "#e11d48" : "#f6f3e9")
        .style("font-family", "JetBrains Mono, monospace")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("cursor", "pointer")
        .text(displayName)
        .on("click", () => setSelectedRequestId(req.id));

      // Resource bar
      g.append("rect")
        .attr("x", startX)
        .attr("y", y + 6)
        .attr("width", barWidth)
        .attr("height", 14)
        .attr("rx", 3)
        .attr("fill", getColor(req.resourceType, req.failed))
        .attr("opacity", 0.9)
        .style("cursor", "pointer")
        .on("click", () => setSelectedRequestId(req.id));

      // Duration text right next to bar
      g.append("text")
        .attr("x", startX + barWidth + 6)
        .attr("y", y + 16)
        .attr("fill", "#aaa69c")
        .style("font-family", "JetBrains Mono, monospace")
        .style("font-size", "10px")
        .text(formatDuration(req.duration));
    });
  }, [
    requests,
    totalDuration,
    containerWidth,
    selectedRequestId,
    setSelectedRequestId,
  ]);

  return (
    <div
      id="waterfall"
      className="rounded-xl border border-[#424137] bg-[#252525] p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-sans text-xs font-bold text-[#f6f3e9] uppercase tracking-wider">
            Network waterfall
          </h3>
          <p className="text-[11px] font-mono text-[#aaa69c] mt-0.5">
            Click any request row to inspect raw HTTP headers and payload
            breakdown.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5 text-sky-300 font-medium">
            <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" /> HTML
          </span>
          <span className="flex items-center gap-1.5 text-amber-300 font-medium">
            <span className="h-2.5 w-2.5 rounded-sm bg-amber-600" /> JS
          </span>
          <span className="flex items-center gap-1.5 text-purple-700 font-medium">
            <span className="h-2.5 w-2.5 rounded-sm bg-purple-600" /> CSS
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
            <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600" /> Image
          </span>
          <span className="flex items-center gap-1.5 text-rose-300 font-medium">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-600" /> API / XHR
          </span>
        </div>
      </div>

      <div ref={containerRef} className="w-full max-h-[520px] overflow-auto">
        <svg
          ref={svgRef}
          role="img"
          aria-label="Request start times and durations; use the request explorer below for keyboard access."
        />
      </div>
    </div>
  );
};

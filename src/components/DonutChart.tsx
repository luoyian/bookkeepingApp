import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataItem {
  label: string;
  amount: number;
  color: string;
  percent: number;
}

interface DonutChartProps {
  data: DataItem[];
  width: number;
  height: number;
  onSegmentClick?: (label: string) => void;
}

export const DonutChart: React.FC<DonutChartProps> = ({ data, width, height, onSegmentClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const radius = Math.min(width, height) / 2;
    const innerRadius = radius * 0.7;

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const pie = d3.pie<DataItem>()
      .value(d => d.amount)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<DataItem>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4)
      .padAngle(0.02);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        if (onSegmentClick) {
          onSegmentClick(d.data.label);
        }
      });

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .attr('opacity', 1);

  }, [data, width, height]);

  return (
    <svg ref={svgRef} width={width} height={height} className="overflow-visible" />
  );
};

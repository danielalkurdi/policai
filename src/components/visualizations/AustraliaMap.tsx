'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Jurisdiction } from '@/types';

interface JurisdictionData {
  count: number;
  active: number;
}

interface AustraliaMapProps {
  data: Record<Jurisdiction, JurisdictionData>;
  selectedJurisdiction: Jurisdiction | null;
  onJurisdictionClick: (jurisdiction: Jurisdiction) => void;
  onJurisdictionHover: (jurisdiction: Jurisdiction | null) => void;
}

// SVG path data for Australian states/territories (simplified)
const jurisdictionPaths: Record<Jurisdiction, { path: string; labelX: number; labelY: number }> = {
  wa: {
    path: 'M50,100 L50,350 L200,350 L200,100 Z',
    labelX: 125,
    labelY: 225,
  },
  nt: {
    path: 'M200,100 L200,250 L320,250 L320,100 Z',
    labelX: 260,
    labelY: 175,
  },
  sa: {
    path: 'M200,250 L200,380 L340,380 L340,250 Z',
    labelX: 270,
    labelY: 315,
  },
  qld: {
    path: 'M320,100 L320,280 L450,280 L450,100 Z',
    labelX: 385,
    labelY: 190,
  },
  nsw: {
    path: 'M340,280 L340,360 L450,360 L450,280 Z',
    labelX: 395,
    labelY: 320,
  },
  vic: {
    path: 'M340,360 L340,400 L430,400 L430,360 Z',
    labelX: 385,
    labelY: 380,
  },
  tas: {
    path: 'M370,420 L370,460 L420,460 L420,420 Z',
    labelX: 395,
    labelY: 440,
  },
  act: {
    path: 'M400,335 L400,355 L420,355 L420,335 Z',
    labelX: 410,
    labelY: 345,
  },
  federal: {
    path: 'M230,420 L230,460 L280,460 L280,420 Z',
    labelX: 255,
    labelY: 440,
  },
};

const jurisdictionLabels: Record<Jurisdiction, string> = {
  wa: 'WA',
  nt: 'NT',
  sa: 'SA',
  qld: 'QLD',
  nsw: 'NSW',
  vic: 'VIC',
  tas: 'TAS',
  act: 'ACT',
  federal: 'FED',
};

function getColorIntensity(count: number, maxCount: number): string {
  if (count === 0) return 'fill-muted';
  const intensity = Math.min(count / maxCount, 1);
  if (intensity < 0.25) return 'fill-primary/20';
  if (intensity < 0.5) return 'fill-primary/40';
  if (intensity < 0.75) return 'fill-primary/60';
  return 'fill-primary/80';
}

export function AustraliaMap({
  data,
  selectedJurisdiction,
  onJurisdictionClick,
  onJurisdictionHover,
}: AustraliaMapProps) {
  const [hoveredJurisdiction, setHoveredJurisdiction] = useState<Jurisdiction | null>(null);

  const maxCount = Math.max(...Object.values(data).map((d) => d.count), 1);

  const handleMouseEnter = (jurisdiction: Jurisdiction) => {
    setHoveredJurisdiction(jurisdiction);
    onJurisdictionHover(jurisdiction);
  };

  const handleMouseLeave = () => {
    setHoveredJurisdiction(null);
    onJurisdictionHover(null);
  };

  return (
    <svg
      viewBox="0 0 500 500"
      className="w-full h-full max-h-[500px]"
      role="img"
      aria-label="Interactive map of Australian jurisdictions"
    >
      <title>Australian AI Policy Map</title>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Render each jurisdiction */}
      {(Object.keys(jurisdictionPaths) as Jurisdiction[]).map((jurisdiction) => {
        const { path, labelX, labelY } = jurisdictionPaths[jurisdiction];
        const jurisdictionData = data[jurisdiction] || { count: 0, active: 0 };
        const isSelected = selectedJurisdiction === jurisdiction;
        const isHovered = hoveredJurisdiction === jurisdiction;

        return (
          <g
            key={jurisdiction}
            onClick={() => onJurisdictionClick(jurisdiction)}
            onMouseEnter={() => handleMouseEnter(jurisdiction)}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer transition-all duration-200"
            role="button"
            tabIndex={0}
            aria-label={`${jurisdictionLabels[jurisdiction]}: ${jurisdictionData.count} policies`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onJurisdictionClick(jurisdiction);
              }
            }}
          >
            <path
              d={path}
              className={cn(
                getColorIntensity(jurisdictionData.count, maxCount),
                'stroke-border stroke-2 transition-all duration-200',
                isSelected && 'stroke-primary stroke-[3px]',
                isHovered && 'brightness-110'
              )}
              filter={isSelected || isHovered ? 'url(#shadow)' : undefined}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className={cn(
                'text-xs font-bold pointer-events-none select-none',
                jurisdictionData.count > 0 ? 'fill-foreground' : 'fill-muted-foreground'
              )}
            >
              {jurisdictionLabels[jurisdiction]}
            </text>
            <text
              x={labelX}
              y={labelY + 15}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-muted-foreground pointer-events-none select-none"
            >
              {jurisdictionData.count} policies
            </text>
          </g>
        );
      })}

      {/* Legend */}
      <g transform="translate(20, 380)">
        <text className="text-xs font-medium fill-foreground">Policy Density</text>
        <rect x="0" y="10" width="20" height="12" className="fill-muted stroke-border" />
        <rect x="25" y="10" width="20" height="12" className="fill-primary/20 stroke-border" />
        <rect x="50" y="10" width="20" height="12" className="fill-primary/40 stroke-border" />
        <rect x="75" y="10" width="20" height="12" className="fill-primary/60 stroke-border" />
        <rect x="100" y="10" width="20" height="12" className="fill-primary/80 stroke-border" />
        <text x="0" y="35" className="text-[8px] fill-muted-foreground">
          0
        </text>
        <text x="120" y="35" className="text-[8px] fill-muted-foreground">
          High
        </text>
      </g>
    </svg>
  );
}

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

// Accurate SVG paths from Australia states blank SVG
// Original SVG has transform="translate(603,162.63782)" applied to all paths
const jurisdictionPaths: Record<Jurisdiction, { paths: string[]; labelX: number; labelY: number }> = {
  wa: {
    // Western Australia - path3031
    paths: [
      `m 141,46.362183 -32,-6 -13,-4 -31,-28.0000004 -17,-7 -13,-7 -11,0 -8,6.00000002 3,10.00000038 -7,4 -4,-4 -22,8 -9,23 -11,-7 -23,11 -9,13 11,12 -3,0 -9,3 2,18 -13,-3 -16,12.999997 -3,8 2,10 5,8 -9,11 3,8 -19,-2 -12,-3 -9,3 3,8 -4,13 15,16 -3,10 -6,-6 -4,28 c 0,0 -10,-5 -13,-9 -3,-4 -19,-40 -19,-40 l 0,-5 -7,4 -20,24 -12,15 -2,16 6,17 6,14 -7,11 -20,18 -11,37 -13,17 -31,18 -10,8 -27,6 -8,7 -28,-6 -9,17 -5,4 -30,8 -7,6 -7,12 -20,7 -21,-3 -17,2 -14,9 -21,23 -19,24 -28,14 -11,10 -5,32 -9,5 -7,0 -4,-31 -8,2 -10,39 12,17 1,11 -3,27 -7,17 0,27 14,15 9,20 21,23 13,16 1,24 -15,-8 -28,-29 -3,13 17,17 10,14 -23,-3 4,9 32,35 12,21 3,17 32,38 17,25 5,27 1,16 12,26 30,43.00002 7,17 5,44 3,23 -1,13 -5,17 -7,2 -15,-6 0,11 3,24 6,10 11,-4 21,7 17,16 15,6 28,1 28,-3 29,-11 9,-8 14,-19 15,-5 11,-5 3,-16 19,-11 43,-7 27,-5 23,5 38,-7 7,0 9,2 18,-9 12,-17 5,-26 7,-5 20,-4 57,-37.00002 18,-3 38,2 21,-12 34,-18 18,-8 -34,-905.999997 z`
    ],
    labelX: -200,
    labelY: 450,
  },
  nt: {
    // Northern Territory - path3033 + islands (path3035, path3037)
    paths: [
      `m 150,54.362183 15,-3 15,4 1,-13 -15,-15 -1,-10 6,-11.0000004 11,-1 6,-30.9999996 9,3 11,-14 -6,-12 0,-10 9,0 3,-9 12,-7 2,-14 15,0 8,-11 21,6 22,-3 12,4 17,-10.000003 15,-4 -4,-20 -10,-9 -14,-2 -10,-11 24,-10 20,22 10,-7 12,19 24,6 13,-7 2,9 44,8 6,1 15,12.000003 8,1 8,-8.000003 14,2 3,7.000003 13,-3 6,13 9,1 7,-10 -7,-8.000003 14,-7 3,0 6,9.000003 7,2 5,2 5,8 -10,11 -7,11 -8,1 2,13 -6,9 -9,-3 -20,13 0,17 6,5.9999996 -9,16 1,5.0000004 -9,7 -12,20 -4,3 4,14 38,25 4,8 17,9 4,12.999997 19,-3 20,13 16,8 8,15 -18,505 -98,-3 -123,-2 -163,5 -44,1 z`,
      // Melville/Bathurst Islands
      `m 193,-116.63782 20,4 16,-6 15,4 22,-13 8,-11 -1,-12 -11,-3 -27,10 -20,-6 -7,5 -9,11 1,5 z`,
      // Groote Eylandt
      `m 536,17.362183 29,2 6,-7 -10,-8.0000004 3,-14 -20,-6.9999996 -2,6.9999996 -4,20.0000004 z`
    ],
    labelX: 350,
    labelY: 280,
  },
  qld: {
    // Queensland - path3039 + islands (path3823, path3825)
    paths: [
      `m 625,149.36218 15,5 22,8 12,9 10,21 18,7 19,15 17,-4 17,-2 11,-15 12,-21 13,-17 9,-30 2,-19 13,-33.999997 -6,-16 5,-27 -3,-12 -5,-12.0000004 8,-15 8,-11.9999996 -2,-22 10,-5 7,-9 -13,-12 22,-34.000003 8,-34 3,-9 11,-6 10,-10 5,2 -1,7 12,10 1,43 6,7.000003 8,5 -8,14 17,20 0,8 5,15 -3,35.9999996 7,25.0000004 4,18 12,6 13,-12 16,-3 4,17 21,18 10,8 -1,28.999997 5,24 -1,15 -2,14 23,48 7,13 -1,22 -7,16 13,5 -3,24 -1,10 14,17 21,14 21,2 4,12 4,14 23,4 10,21 9,-7 16,15 -5,12 11,24 11,25 4,38 0,20 14,3 4,4 2,-22 9,6 22,24 9,16 -5,32 24,33 14,3 9,14 3,17 18,13 4,13 5,13 8,7 -1,17 8,14 -2,7 -6,9 1,39 -1,10 -8,-1 5,13 9,20 -2,25 -24,2 -20,-8 -30,16 -2,15 -12,-1 -5,-1 -9,11 -5,1 2,-10 -7,-8 -5,-7 -13,-5 -13,0 -6,-10 -24,4 -15,-8 -14,5 -14,14 -157,-15 -86,-10 -117,-8 -11,-1 11,-160 -142,-7 z`,
      // Small island
      `m 682.5,156.86218 6.5,1 8,-2.5 11,-5.5 5.5,-1 1.5,-5.5 -2,-4.5 -15,-2.5 -8,2.5 -6.5,5 -4,5.5 -0.5,5.5 z`,
      // Fraser Island area
      `m 1329,683.36218 3,14 7,2 9,-13 4,-18 -11,-8 -7,5 z`
    ],
    labelX: 900,
    labelY: 450,
  },
  sa: {
    // South Australia - path3815 + Kangaroo Island (path3827)
    paths: [
      `m 700.5,1306.8622 -14,-2 -10.5,-12 -19,-34.5 -4,-13 4,-10 -5,-22 -3.5,-21.5 -13.5,-12 -14.5,-12 -11,1.5 -6.5,2 -13,-1.5 1,-6.5 12.5,-21 2.5,-11 -0.5,-11 -16.5,-26 -3.5,10 -11,37.5 -8.5,4 -23.5,0 -5,-11.5 5.5,-4 12.5,-0.5 2,-8 3,-26 5.5,-20 14,-12 3.5,-6 -0.5,-16 6.5,-3.5 2,-2.5 -11.5,-32 -4.5,1 -1,18 -7,7.5 -12.5,21.5 -6,12 -12,2 -18,12.5 -13.5,19.5 -11.5,18.5 -11.5,8.5 -11,-4.5 -11.5,-38.5 -0.5,-10 -14,-13.5 -9.5,-21.5 -12.5,-4.5 -9,-9 -4,-7.5 6,-11 -10,-5.50002 -5,-7.5 -6.5,-10.5 -9.5,-4.5 -15.5,5 -8,-6 -10.5,-5.5 -10.5,-2 -5,4 -8,0 -12,-8.5 -18,-11 -15.5,-7.5 -5.5,-1 -4.5,1 -7.5,4 -23.5,0.5 -58,4 -12.5,-297 181,-3.5 142.5,0.5 146.5,6 100,4 -37.5,644.00002 z`,
      // Kangaroo Island
      `m 527,1164.3622 -1,11 8,6 10,0 28,-2 10,-10 -10,-11 -10,0 z`
    ],
    labelX: 450,
    labelY: 1050,
  },
  nsw: {
    // New South Wales - path3041
    paths: [
      `m 739,825.36218 146,12 107,10 120,13 15,-15 12,-3 10,3 21,-1 7,5 6,2 11,2 7,5 5,4 7,8 1,10 7,2 8,-4 5,-9 9,5 11,0 4,-10 -1,-9 24,-11 11,3 10,5 24,-5 -1,26 -13,24 -11,31 -13,29 0,18 -9,21 -11,24.00002 -10,12 -8,12 -5,14 -36,23 -28,33 -9,22 -11,20 -9,30 -13,13 -18,19 -10,25 -8,24 -6,36 -5,6 -66,-43 1,-15 -4,-10 0,-17 -18,-8 -21,3 -19,-4 -23,-1 -27,-9 -17,-7 -15,3 -1,6 1,6 -3,1 -7,-4 -11,-18 -12,-13 -16,-9 -5,-9 -7,-8 4,-17 -10,-4.5 -18.5,-6 -8.5,6.5 -7,-16 -1,-9 -19,-13 -9,-3 -9,5 -21,-8 z`
    ],
    labelX: 1000,
    labelY: 1000,
  },
  vic: {
    // Victoria - path3813
    paths: [
      `m 721,1096.3622 -12,215 24,17 12,-8 17,7 26,14 22,16 43,-20 9,-8 13,-19 6,11 -6,14 -2,6 24,14 14,9 4,7 38,-8 31,-28 27,-9 34,-1 31,2 12,-12 -68,-45 -3,-8 3,-12 -4,-4 -2,-16 -9,-3 -12,-2 -9,4 -13,-4 -9,-4 -12,5 -9,-4 -29,-10 -10,-4 -12,0 -2,11 -6,3 -9.5,-1 -9.5,-15 -8,-14 -15,-12 -14,-5 -7.5,-13.5 -1,-14.5 -3,-10 -10,-3 -8.5,-2 -8,7 -8,-12 -5,-7 0,-9 -17,-10 -9,3 -11,-2 z`
    ],
    labelX: 870,
    labelY: 1250,
  },
  tas: {
    // Tasmania - path3817 + King Island (path3821) + Flinders Island (path3819)
    paths: [
      // Main Tasmania
      `m 924,1631.8622 9.5,-16 8,-3 10.5,-20.5 4.5,0 12,2 6,-7.5 8.5,-29 10,-9.5 2.5,-22.5 1,-19 4.5,-13 c 0,0 -10,-14 -12,-14 -2,0 -14.5,8.5 -14.5,8.5 l -26,0.5 -11,3 -18,4.5 -31,-15 -32,-16.5 -4.5,0.5 -3,10.5 -2.5,10.5 7.5,23.5 7.5,17.5 8.5,16 3.5,14 -3,9.5 -0.5,7.5 14.5,32 7.5,17 6,3 11,-1 10.5,6.5 z`,
      // Flinders Island
      `m 985,1428.3622 6,-6 3.5,-0.5 6.5,9.5 5.5,10 -0.5,12.5 -9,2.5 -6.5,-11 -4.5,-12 z`,
      // King Island
      `m 823.5,1395.3622 -4.5,12 0,15.5 3.5,5.5 4.5,1 4.5,-5.5 4,-12 -0.5,-9.5 -1.5,-4 -3,-4 z`
    ],
    labelX: 920,
    labelY: 1530,
  },
  act: {
    // ACT - small path3043 (shown as marker)
    paths: [
      `m 1057,1200.3622 9,-14 12,0 4,11 -9,11 -5,20 -9,-10 -3,-10 z`
    ],
    labelX: 1065,
    labelY: 1200,
  },
  federal: {
    // Federal - represented as a marker/badge (not a geographic region)
    paths: [],
    labelX: 100,
    labelY: 1550,
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

const jurisdictionFullNames: Record<Jurisdiction, string> = {
  wa: 'Western Australia',
  nt: 'Northern Territory',
  sa: 'South Australia',
  qld: 'Queensland',
  nsw: 'New South Wales',
  vic: 'Victoria',
  tas: 'Tasmania',
  act: 'Australian Capital Territory',
  federal: 'Federal',
};

function getColorClass(count: number, maxCount: number, isHovered: boolean): string {
  if (count === 0) {
    return isHovered ? 'fill-amber-200 dark:fill-slate-600' : 'fill-amber-100 dark:fill-slate-700';
  }
  const intensity = Math.min(count / maxCount, 1);
  if (isHovered) {
    if (intensity < 0.25) return 'fill-emerald-300 dark:fill-emerald-800';
    if (intensity < 0.5) return 'fill-emerald-500 dark:fill-emerald-600';
    if (intensity < 0.75) return 'fill-emerald-600 dark:fill-emerald-500';
    return 'fill-emerald-700 dark:fill-emerald-400';
  }
  if (intensity < 0.25) return 'fill-emerald-200 dark:fill-emerald-900';
  if (intensity < 0.5) return 'fill-emerald-400 dark:fill-emerald-700';
  if (intensity < 0.75) return 'fill-emerald-500 dark:fill-emerald-600';
  return 'fill-emerald-600 dark:fill-emerald-500';
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

  const activeJurisdiction = hoveredJurisdiction || selectedJurisdiction;

  // Render order for proper layering
  const renderOrder: Jurisdiction[] = ['wa', 'sa', 'nt', 'qld', 'nsw', 'vic', 'tas', 'act'];

  return (
    <div className="relative">
      <svg
        viewBox="-603 -163 1955 1795"
        className="w-full h-auto max-h-[550px]"
        role="img"
        aria-label="Interactive map of Australian jurisdictions"
        preserveAspectRatio="xMidYMid meet"
      >
        <title>Australian AI Policy Map</title>
        <defs>
          <filter id="stateShadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.12" />
          </filter>
          <filter id="selectedShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#059669" floodOpacity="0.35" />
          </filter>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ecfeff" />
            <stop offset="100%" stopColor="#cffafe" />
          </linearGradient>
        </defs>

        {/* Ocean background */}
        <rect x="-603" y="-163" width="1955" height="1795" className="fill-[url(#oceanGradient)] dark:fill-slate-900" />

        {/* Render each jurisdiction */}
        {renderOrder.map((jurisdiction) => {
          const { paths, labelX, labelY } = jurisdictionPaths[jurisdiction];
          const jurisdictionData = data[jurisdiction] || { count: 0, active: 0 };
          const isSelected = selectedJurisdiction === jurisdiction;
          const isHovered = hoveredJurisdiction === jurisdiction;

          if (paths.length === 0) return null;

          return (
            <g
              key={jurisdiction}
              onClick={() => onJurisdictionClick(jurisdiction)}
              onMouseEnter={() => handleMouseEnter(jurisdiction)}
              onMouseLeave={handleMouseLeave}
              className="cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`${jurisdictionFullNames[jurisdiction]}: ${jurisdictionData.count} policies`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onJurisdictionClick(jurisdiction);
                }
              }}
            >
              {/* Render all paths for this jurisdiction */}
              {paths.map((pathD, index) => (
                <path
                  key={index}
                  d={pathD}
                  className={cn(
                    'transition-all duration-200 ease-out',
                    getColorClass(jurisdictionData.count, maxCount, isHovered && !isSelected),
                    'stroke-slate-400 dark:stroke-slate-500',
                    isSelected
                      ? 'stroke-emerald-600 dark:stroke-emerald-400 stroke-[4px]'
                      : isHovered
                        ? 'stroke-emerald-500 dark:stroke-emerald-500 stroke-[3px]'
                        : 'stroke-[2px]'
                  )}
                  filter={isSelected ? 'url(#selectedShadow)' : 'url(#stateShadow)'}
                />
              ))}

              {/* State label */}
              <g className="pointer-events-none">
                <rect
                  x={labelX - 55}
                  y={labelY - 35}
                  width="110"
                  height="65"
                  rx="8"
                  className={cn(
                    'transition-all duration-200',
                    (isSelected || isHovered)
                      ? 'fill-white/95 dark:fill-slate-800/95'
                      : 'fill-white/80 dark:fill-slate-800/80'
                  )}
                />
                <text
                  x={labelX}
                  y={labelY - 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    'text-[28px] font-bold select-none transition-colors duration-200',
                    isSelected || isHovered
                      ? 'fill-emerald-700 dark:fill-emerald-300'
                      : 'fill-slate-700 dark:fill-slate-200'
                  )}
                >
                  {jurisdictionLabels[jurisdiction]}
                </text>
                <text
                  x={labelX}
                  y={labelY + 18}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={cn(
                    'text-[18px] select-none transition-colors duration-200',
                    isSelected || isHovered
                      ? 'fill-emerald-600 dark:fill-emerald-400 font-semibold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  )}
                >
                  {jurisdictionData.count} {jurisdictionData.count === 1 ? 'policy' : 'policies'}
                </text>
              </g>
            </g>
          );
        })}


        {/* Legend */}
        <g transform="translate(-550, 1450)">
          <rect x="-15" y="-15" width="280" height="100" rx="10" className="fill-white/90 dark:fill-slate-800/90 stroke-slate-200 dark:stroke-slate-700" />
          <text x="0" y="10" className="text-[22px] font-semibold fill-slate-700 dark:fill-slate-200">Policy Density</text>
          <g transform="translate(0, 30)">
            <rect x="0" width="40" height="24" rx="4" className="fill-amber-100 dark:fill-slate-700 stroke-slate-300 dark:stroke-slate-600" />
            <rect x="48" width="40" height="24" rx="4" className="fill-emerald-200 dark:fill-emerald-900 stroke-slate-300 dark:stroke-slate-600" />
            <rect x="96" width="40" height="24" rx="4" className="fill-emerald-400 dark:fill-emerald-700 stroke-slate-300 dark:stroke-slate-600" />
            <rect x="144" width="40" height="24" rx="4" className="fill-emerald-500 dark:fill-emerald-600 stroke-slate-300 dark:stroke-slate-600" />
            <rect x="192" width="40" height="24" rx="4" className="fill-emerald-600 dark:fill-emerald-500 stroke-slate-300 dark:stroke-slate-600" />
          </g>
          <text x="5" y="75" className="text-[14px] fill-slate-500 dark:fill-slate-400">None</text>
          <text x="210" y="75" className="text-[14px] fill-slate-500 dark:fill-slate-400">High</text>
        </g>
      </svg>

      {/* Federal Government Banner - Below the map */}
      <div
        onClick={() => onJurisdictionClick('federal')}
        onMouseEnter={() => handleMouseEnter('federal')}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onJurisdictionClick('federal');
          }
        }}
        className={cn(
          'mt-4 p-5 rounded-xl cursor-pointer transition-all duration-200',
          'border-2 flex items-center justify-between',
          selectedJurisdiction === 'federal'
            ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-500 shadow-lg shadow-blue-500/20'
            : hoveredJurisdiction === 'federal'
              ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-400 shadow-md'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800 border-blue-200 dark:border-slate-700 hover:border-blue-300'
        )}
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center',
            selectedJurisdiction === 'federal' || hoveredJurisdiction === 'federal'
              ? 'bg-blue-500 dark:bg-blue-600'
              : 'bg-blue-400 dark:bg-blue-700'
          )}>
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>
          <div>
            <h3 className={cn(
              'text-xl font-bold',
              selectedJurisdiction === 'federal' || hoveredJurisdiction === 'federal'
                ? 'text-blue-700 dark:text-blue-300'
                : 'text-slate-800 dark:text-slate-200'
            )}>
              Federal Government (Commonwealth)
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Australian Government departments and agencies
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className={cn(
            'text-3xl font-bold',
            selectedJurisdiction === 'federal' || hoveredJurisdiction === 'federal'
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-blue-500 dark:text-blue-500'
          )}>
            {data.federal?.count || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {data.federal?.count === 1 ? 'policy' : 'policies'}
          </div>
        </div>
      </div>

      {/* Floating info panel - only for map states, not Federal (which has its own banner) */}
      {activeJurisdiction && activeJurisdiction !== 'federal' && (
        <div
          className={cn(
            "absolute top-4 right-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm",
            "rounded-xl shadow-xl p-4 border border-slate-200 dark:border-slate-700",
            "min-w-[190px] transition-all duration-200 ease-out z-10"
          )}
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className={cn(
              "w-4 h-4 rounded-md shadow-sm",
              getColorClass(data[activeJurisdiction]?.count || 0, maxCount, false).replace('fill-', 'bg-')
            )} />
            <h3 className="font-bold text-slate-900 dark:text-white">
              {jurisdictionFullNames[activeJurisdiction]}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total Policies</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                {data[activeJurisdiction]?.count || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500 dark:text-slate-400">Active</span>
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {data[activeJurisdiction]?.active || 0}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {selectedJurisdiction === activeJurisdiction ? (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Selected — see details in panel
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Click to view policies and agencies
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const mockMapRegions = [
  { id: 1, x: 20, y: 35, radius: 30, risk: 87, name: "Westside District" },
  { id: 2, x: 75, y: 20, radius: 25, risk: 63, name: "North County" },
  { id: 3, x: 70, y: 65, radius: 20, risk: 41, name: "Eastview" },
  { id: 4, x: 30, y: 75, radius: 25, risk: 75, name: "Southgate" },
  { id: 5, x: 50, y: 40, radius: 22, risk: 52, name: "Central Park Area" },
];

interface CommunityMapProps {
  isLoading: boolean;
}

const CommunityMap = ({ isLoading }: CommunityMapProps) => {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  const getRiskColor = (risk: number) => {
    // Create a gradient from green to yellow to red
    if (risk < 30) return 'rgba(74, 222, 128, 0.7)'; // green
    if (risk < 50) return 'rgba(163, 230, 53, 0.7)'; // lime
    if (risk < 70) return 'rgba(251, 191, 36, 0.7)'; // amber
    if (risk < 85) return 'rgba(249, 115, 22, 0.7)'; // orange
    return 'rgba(248, 113, 113, 0.7)'; // red
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  return (
    <div className="relative w-full h-[500px] bg-muted/30 border-t">
      <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-md border shadow-sm">
        <h3 className="font-semibold text-sm mb-2">Risk Legend</h3>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-400"></div>
            <span className="text-xs">Low Risk (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-400"></div>
            <span className="text-xs">Medium Risk (51-70)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-400"></div>
            <span className="text-xs">High Risk (71-100)</span>
          </div>
        </div>
      </div>

      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.2"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Map background elements */}
        <rect x="10" y="10" width="80" height="80" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="0.3" rx="2" />
        <path d="M 30 10 L 30 90" stroke="rgba(0,0,0,0.05)" strokeWidth="0.3" strokeDasharray="1,1" />
        <path d="M 70 10 L 70 90" stroke="rgba(0,0,0,0.05)" strokeWidth="0.3" strokeDasharray="1,1" />
        <path d="M 10 30 L 90 30" stroke="rgba(0,0,0,0.05)" strokeWidth="0.3" strokeDasharray="1,1" />
        <path d="M 10 70 L 90 70" stroke="rgba(0,0,0,0.05)" strokeWidth="0.3" strokeDasharray="1,1" />

        {/* Water features */}
        <path d="M 60 20 C 70 25, 75 40, 65 45 C 60 50, 55 45, 60 20" fill="rgba(147, 197, 253, 0.3)" />
        <path d="M 15 60 Q 25 65, 25 75 Q 20 85, 15 60" fill="rgba(147, 197, 253, 0.3)" />

        {/* Risk regions */}
        {mockMapRegions.map((region) => (
          <g 
            key={region.id} 
            className="map-marker" 
            onMouseEnter={() => setSelectedRegion(region.id)}
            onMouseLeave={() => setSelectedRegion(null)}
          >
            <circle
              cx={region.x}
              cy={region.y}
              r={region.radius / 10}
              fill={getRiskColor(region.risk)}
              stroke={selectedRegion === region.id ? "black" : "rgba(0,0,0,0.1)"}
              strokeWidth={selectedRegion === region.id ? "0.4" : "0.2"}
              opacity={0.8}
            />
            <circle
              cx={region.x}
              cy={region.y}
              r={region.radius / 2}
              fill={getRiskColor(region.risk)}
              opacity={0.3}
            />
          </g>
        ))}

        {/* Show tooltip for selected region */}
        {selectedRegion !== null && (
          (() => {
            const region = mockMapRegions.find(r => r.id === selectedRegion);
            if (!region) return null;
            
            return (
              <g>
                <rect
                  x={region.x + 2}
                  y={region.y - 10}
                  width="25"
                  height="16"
                  rx="2"
                  fill="white"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="0.2"
                />
                <text
                  x={region.x + 4}
                  y={region.y + 1}
                  fontSize="3"
                  fill="black"
                >
                  {region.name}: {region.risk}
                </text>
              </g>
            );
          })()
        )}
      </svg>
    </div>
  );
};

export default CommunityMap;

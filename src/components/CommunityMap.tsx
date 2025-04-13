import { CommunityData } from "@/types/health";
import { MapContainer, TileLayer, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";

interface CommunityMapProps {
  isLoading: boolean;
  communityData: CommunityData[];
}

const CommunityMap = ({ isLoading, communityData }: CommunityMapProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-health-600" />
      </div>
    );
  }

  const getColor = (riskScore: number) => {
    if (riskScore >= 75) return "#ef4444"; // red-500
    if (riskScore >= 50) return "#f59e0b"; // amber-500
    return "#22c55e"; // green-500
  };

  return (
    <MapContainer
      center={[51.505, -0.09]}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {communityData.map((community) => (
        <Circle
          key={community.id}
          center={[community.location.latitude, community.location.longitude]}
          radius={500}
          pathOptions={{
            color: getColor(community.riskScore),
            fillColor: getColor(community.riskScore),
            fillOpacity: 0.5,
          }}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium">{community.name}</h3>
              <p className="text-sm text-muted-foreground">
                Risk Score: {Math.round(community.riskScore)}/100
              </p>
              <p className="text-sm text-muted-foreground">
                Population: {community.population.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Trend: {community.trends}
              </p>
            </div>
          </Popup>
        </Circle>
      ))}
    </MapContainer>
  );
};

export default CommunityMap;

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2 } from "lucide-react";
import { CommunityData } from "@/types/health";

// Import marker icons
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

interface CommunityMapProps {
  isLoading: boolean;
  communities: CommunityData[];
}

export function CommunityMap({ isLoading, communities }: CommunityMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    // Fix Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
    setMapReady(true);
  }, []);

  if (isLoading || !mapReady) {
    return (
      <div className="flex h-[500px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <MapContainer
      center={[39.8283, -98.5795]}
      zoom={4}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {!isLoading && mapReady && communities.map((community) => (
        <Marker
          key={community.id}
          position={[community.location.latitude, community.location.longitude]}
          icon={new L.Icon({
            iconUrl: markerIcon,
            iconRetinaUrl: markerIcon2x,
            shadowUrl: markerShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
          })}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-bold">{community.name}</h3>
              <p>Risk Score: {community.riskScore}</p>
              <p>Population: {community.population.toLocaleString()}</p>
              <p>Trend: {community.trends}</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

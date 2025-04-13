import { CommunityData } from "@/types/health";
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

  return (
    <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Community Health Map</h3>
        <p className="text-sm text-muted-foreground">
          {communityData.length} communities analyzed
        </p>
      </div>
    </div>
  );
};

export default CommunityMap;

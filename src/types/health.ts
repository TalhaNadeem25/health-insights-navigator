export interface CommunityData {
  id: string;
  name: string;
  population: number;
  riskScore: number;
  trends: "Increasing" | "Stable" | "Decreasing";
  location: {
    latitude: number;
    longitude: number;
  };
  riskFactors: RiskFactor[];
  lastUpdated: string;
}

export interface HealthTrend {
  date: string;
  diabetesRisk: number;
  heartRisk: number;
  respiratoryRisk: number;
  obesityRisk: number;
  smokingRisk: number;
}

export interface RiskFactor {
  type: "diabetes" | "heartDisease" | "respiratory" | "obesity" | "smoking";
  value: number;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
  source: string;
}

export interface CommunityInsight {
  communityId: string;
  type: string;
  title: string;
  description: string;
  confidence: number;
  generationDate: string;
  recommendations?: string[];
  sources: string[];
} 
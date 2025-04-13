import { CommunityData, HealthTrend, RiskFactor } from "@/types/health";

// API endpoints for HealthData.gov
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://healthdata.gov/api/3/action/datastore_search';
const USE_REAL_DATA = import.meta.env.VITE_USE_REAL_DATA === 'true';

// HealthData.gov dataset IDs
const DATASETS = {
  COMMUNITY_HEALTH: import.meta.env.VITE_COMMUNITY_HEALTH_DATASET || '6b86-4b8f',
  HEALTH_TRENDS: import.meta.env.VITE_HEALTH_TRENDS_DATASET || '7c33-4b8f',
  RISK_FACTORS: import.meta.env.VITE_RISK_FACTORS_DATASET || '8d33-4b8f'
};

// Mock data for development when API is not available
const mockCommunityData: CommunityData[] = [
  {
    id: "1",
    name: "Downtown",
    population: 25000,
    riskScore: 65,
    riskFactors: [
      { type: "diabetes", value: 0.15, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "heartDisease", value: 0.12, trend: "stable", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "respiratory", value: 0.08, trend: "down", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "obesity", value: 0.22, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "smoking", value: 0.18, trend: "down", lastUpdated: "2023-05-01", source: "CDC" }
    ],
    trends: "Increasing",
    location: {
      latitude: 40.7128,
      longitude: -74.0060
    },
    lastUpdated: "2023-05-01"
  },
  {
    id: "2",
    name: "Suburbia",
    population: 18000,
    riskScore: 45,
    riskFactors: [
      { type: "diabetes", value: 0.10, trend: "stable", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "heartDisease", value: 0.08, trend: "down", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "respiratory", value: 0.05, trend: "stable", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "obesity", value: 0.15, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "smoking", value: 0.12, trend: "down", lastUpdated: "2023-05-01", source: "CDC" }
    ],
    trends: "Stable",
    location: {
      latitude: 40.7589,
      longitude: -73.9851
    },
    lastUpdated: "2023-05-01"
  },
  {
    id: "3",
    name: "Rural Area",
    population: 12000,
    riskScore: 78,
    riskFactors: [
      { type: "diabetes", value: 0.18, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "heartDisease", value: 0.15, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "respiratory", value: 0.10, trend: "stable", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "obesity", value: 0.25, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
      { type: "smoking", value: 0.22, trend: "up", lastUpdated: "2023-05-01", source: "CDC" }
    ],
    trends: "Increasing",
    location: {
      latitude: 40.7829,
      longitude: -73.9654
    },
    lastUpdated: "2023-05-01"
  }
];

const mockHealthTrends: HealthTrend[] = [
  {
    date: "2023-01-01",
    diabetesRisk: 12,
    heartRisk: 10,
    respiratoryRisk: 8,
    obesityRisk: 18,
    smokingRisk: 15
  },
  {
    date: "2023-02-01",
    diabetesRisk: 13,
    heartRisk: 11,
    respiratoryRisk: 9,
    obesityRisk: 19,
    smokingRisk: 16
  },
  {
    date: "2023-03-01",
    diabetesRisk: 14,
    heartRisk: 12,
    respiratoryRisk: 10,
    obesityRisk: 20,
    smokingRisk: 17
  },
  {
    date: "2023-04-01",
    diabetesRisk: 15,
    heartRisk: 13,
    respiratoryRisk: 11,
    obesityRisk: 21,
    smokingRisk: 18
  },
  {
    date: "2023-05-01",
    diabetesRisk: 16,
    heartRisk: 14,
    respiratoryRisk: 12,
    obesityRisk: 22,
    smokingRisk: 19
  }
];

const mockRiskFactors: RiskFactor[] = [
  { type: "diabetes", value: 0.15, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
  { type: "heartDisease", value: 0.12, trend: "stable", lastUpdated: "2023-05-01", source: "CDC" },
  { type: "respiratory", value: 0.08, trend: "down", lastUpdated: "2023-05-01", source: "CDC" },
  { type: "obesity", value: 0.22, trend: "up", lastUpdated: "2023-05-01", source: "CDC" },
  { type: "smoking", value: 0.18, trend: "down", lastUpdated: "2023-05-01", source: "CDC" }
];

export const healthDataService = {
  async getCommunityData(): Promise<CommunityData[]> {
    if (!USE_REAL_DATA) {
      console.log('Using mock community data for development');
      return mockCommunityData;
    }

    try {
      // Fetch from HealthData.gov API
      const response = await fetch(`${API_BASE_URL}?resource_id=${DATASETS.COMMUNITY_HEALTH}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch community data');
      }
      const data = await response.json();
      console.log('Successfully fetched real community data from HealthData.gov');
      return this.transformCommunityData(data.result.records);
    } catch (error) {
      console.error('Error fetching community data:', error);
      console.log('Falling back to mock community data');
      return mockCommunityData;
    }
  },

  async getHealthTrends(): Promise<HealthTrend[]> {
    if (!USE_REAL_DATA) {
      console.log('Using mock health trends data for development');
      return mockHealthTrends;
    }

    try {
      // Fetch from HealthData.gov API
      const response = await fetch(`${API_BASE_URL}?resource_id=${DATASETS.HEALTH_TRENDS}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch health trends');
      }
      const data = await response.json();
      console.log('Successfully fetched real health trends data from HealthData.gov');
      return this.transformHealthTrends(data.result.records);
    } catch (error) {
      console.error('Error fetching health trends:', error);
      console.log('Falling back to mock health trends data');
      return mockHealthTrends;
    }
  },

  async getRiskFactors(): Promise<RiskFactor[]> {
    if (!USE_REAL_DATA) {
      console.log('Using mock risk factors data for development');
      return mockRiskFactors;
    }

    try {
      // Fetch from HealthData.gov API
      const response = await fetch(`${API_BASE_URL}?resource_id=${DATASETS.RISK_FACTORS}&limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch risk factors');
      }
      const data = await response.json();
      console.log('Successfully fetched real risk factors data from HealthData.gov');
      return this.transformRiskFactors(data.result.records);
    } catch (error) {
      console.error('Error fetching risk factors:', error);
      console.log('Falling back to mock risk factors data');
      return mockRiskFactors;
    }
  },

  async getCommunityInsights(communityId: string): Promise<string> {
    if (!USE_REAL_DATA) {
      console.log('Using mock community insights data for development');
      return `This is a mock insight for community ${communityId}. In a real implementation, this would be generated from actual data.`;
    }

    try {
      // For insights, we'll use the community data to generate insights
      const communityData = await this.getCommunityData();
      const community = communityData.find(c => c.id === communityId);
      
      if (!community) {
        return `No data available for community ${communityId}.`;
      }
      
      // Generate insights based on the community data
      const insights = this.generateInsights(community);
      console.log('Successfully generated real community insights from HealthData.gov data');
      return insights;
    } catch (error) {
      console.error('Error generating community insights:', error);
      console.log('Falling back to mock community insights data');
      return `Unable to generate insights for community ${communityId} at this time.`;
    }
  },

  // Helper function to generate insights from community data
  generateInsights(community: CommunityData): string {
    const highRiskFactors = community.riskFactors
      .filter(factor => factor.value > 0.15)
      .map(factor => factor.type);
    
    const improvingFactors = community.riskFactors
      .filter(factor => factor.trend === "down")
      .map(factor => factor.type);
    
    const worseningFactors = community.riskFactors
      .filter(factor => factor.trend === "up")
      .map(factor => factor.type);
    
    let insights = `Health insights for ${community.name}:\n\n`;
    
    if (community.riskScore > 70) {
      insights += `This community has a high overall health risk score of ${community.riskScore.toFixed(1)}.\n`;
    } else if (community.riskScore < 30) {
      insights += `This community has a low overall health risk score of ${community.riskScore.toFixed(1)}.\n`;
    } else {
      insights += `This community has a moderate overall health risk score of ${community.riskScore.toFixed(1)}.\n`;
    }
    
    if (highRiskFactors.length > 0) {
      insights += `\nAreas of concern:\n`;
      highRiskFactors.forEach(factor => {
        insights += `- High ${factor} rate\n`;
      });
    }
    
    if (improvingFactors.length > 0) {
      insights += `\nImproving areas:\n`;
      improvingFactors.forEach(factor => {
        insights += `- ${factor} rates are decreasing\n`;
      });
    }
    
    if (worseningFactors.length > 0) {
      insights += `\nWorsening areas:\n`;
      worseningFactors.forEach(factor => {
        insights += `- ${factor} rates are increasing\n`;
      });
    }
    
    return insights;
  },

  // Helper function to calculate risk score based on real data
  calculateRiskScore(factors: RiskFactor[]): number {
    const weights = {
      diabetes: 0.3,
      heartDisease: 0.3,
      respiratory: 0.2,
      obesity: 0.1,
      smoking: 0.1
    };

    return factors.reduce((score, factor) => {
      return score + (factor.value * weights[factor.type as keyof typeof weights]);
    }, 0) * 100;
  },

  // Data transformation functions for HealthData.gov API responses
  transformCommunityData(data: any[]): CommunityData[] {
    return data.map((item: any) => ({
      id: item.county_fips || item.id,
      name: item.county_name || item.name,
      population: parseInt(item.population),
      riskScore: this.calculateRiskScore([
        { type: "diabetes", value: parseFloat(item.diabetes_rate || item.diabetes) / 100 },
        { type: "heartDisease", value: parseFloat(item.heart_disease_rate || item.heart_disease) / 100 },
        { type: "respiratory", value: parseFloat(item.respiratory_rate || item.respiratory) / 100 },
        { type: "obesity", value: parseFloat(item.obesity_rate || item.obesity) / 100 },
        { type: "smoking", value: parseFloat(item.smoking_rate || item.smoking) / 100 }
      ]),
      riskFactors: [
        { type: "diabetes", value: parseFloat(item.diabetes_rate || item.diabetes) / 100, trend: item.diabetes_trend || "stable", lastUpdated: item.year || item.last_updated, source: "HealthData.gov" },
        { type: "heartDisease", value: parseFloat(item.heart_disease_rate || item.heart_disease) / 100, trend: item.heart_disease_trend || "stable", lastUpdated: item.year || item.last_updated, source: "HealthData.gov" },
        { type: "respiratory", value: parseFloat(item.respiratory_rate || item.respiratory) / 100, trend: item.respiratory_trend || "stable", lastUpdated: item.year || item.last_updated, source: "HealthData.gov" },
        { type: "obesity", value: parseFloat(item.obesity_rate || item.obesity) / 100, trend: item.obesity_trend || "stable", lastUpdated: item.year || item.last_updated, source: "HealthData.gov" },
        { type: "smoking", value: parseFloat(item.smoking_rate || item.smoking) / 100, trend: item.smoking_trend || "stable", lastUpdated: item.year || item.last_updated, source: "HealthData.gov" }
      ],
      trends: item.trends || "Stable",
      location: {
        latitude: parseFloat(item.latitude),
        longitude: parseFloat(item.longitude)
      },
      lastUpdated: item.year || item.last_updated
    }));
  },

  transformHealthTrends(data: any[]): HealthTrend[] {
    return data.map((item: any) => ({
      date: item.year || item.date,
      diabetesRisk: parseFloat(item.diabetes_rate || item.diabetes),
      heartRisk: parseFloat(item.heart_disease_rate || item.heart_disease),
      respiratoryRisk: parseFloat(item.respiratory_rate || item.respiratory),
      obesityRisk: parseFloat(item.obesity_rate || item.obesity),
      smokingRisk: parseFloat(item.smoking_rate || item.smoking)
    }));
  },

  transformRiskFactors(data: any[]): RiskFactor[] {
    return data.map((item: any) => ({
      type: (item.factor_type || item.type || "").toLowerCase(),
      value: parseFloat(item.rate || item.value) / 100,
      trend: item.trend || "stable",
      lastUpdated: item.year || item.last_updated,
      source: "HealthData.gov"
    }));
  }
}; 
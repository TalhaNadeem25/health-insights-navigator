import { CommunityData, HealthTrend, RiskFactor } from "@/types/health";

// API endpoints - replace with your actual API endpoints
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const healthDataService = {
  async getCommunityData(): Promise<CommunityData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/communities`);
      if (!response.ok) {
        throw new Error('Failed to fetch community data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching community data:', error);
      throw error;
    }
  },

  async getHealthTrends(): Promise<HealthTrend[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/trends`);
      if (!response.ok) {
        throw new Error('Failed to fetch health trends');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching health trends:', error);
      throw error;
    }
  },

  async getRiskFactors(): Promise<RiskFactor[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/risk-factors`);
      if (!response.ok) {
        throw new Error('Failed to fetch risk factors');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching risk factors:', error);
      throw error;
    }
  },

  async getCommunityInsights(communityId: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/insights/${communityId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch community insights');
      }
      const data = await response.json();
      return data.insights;
    } catch (error) {
      console.error('Error fetching community insights:', error);
      throw error;
    }
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
  }
}; 
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import apiModule from '@/lib/api';

const { assessments } = apiModule;

interface HealthMetrics {
  diabetesRisk: number | null;
  heartRisk: number | null;
  lastUpdated: string | null;
  recommendations?: string[];
}

const Dashboard = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    diabetesRisk: null,
    heartRisk: null,
    lastUpdated: null,
    recommendations: []
  });

  // Fetch health metrics on component mount
  useEffect(() => {
    const fetchHealthMetrics = async () => {
      try {
        setLoading(true);
        // Try to get the latest health assessment
        const response = await assessments.getLatest();
        if (response.success && response.assessment) {
          setHealthMetrics({
            diabetesRisk: response.assessment.diabetesRisk,
            heartRisk: response.assessment.heartRisk,
            lastUpdated: response.assessment.updatedAt,
            recommendations: response.assessment.recommendations
          });
        }
      } catch (error) {
        console.error('Failed to fetch health metrics:', error);
        // If no assessments found, that's expected for new users
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchHealthMetrics();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStartAssessment = () => {
    navigate('/risk-assessment');
  };

  const handleUpdateProfile = () => {
    navigate('/profile');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRiskLevel = (score: number | null) => {
    if (score === null) return { label: "Unknown", color: "text-gray-500" };
    if (score >= 75) return { label: "High Risk", color: "text-red-500" };
    if (score >= 50) return { label: "Moderate Risk", color: "text-amber-500" };
    return { label: "Low Risk", color: "text-green-500" };
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back!</CardTitle>
            <CardDescription>Your personal health dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-gray-500">Name</h3>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Email</h3>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-500">Last Login</h3>
                <p className="font-medium">Today</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleLogout} variant="outline">Logout</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Health Metrics</CardTitle>
            <CardDescription>Your latest health data</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : healthMetrics.diabetesRisk !== null ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Diabetes Risk</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${healthMetrics.diabetesRisk}%` }}
                      ></div>
                    </div>
                    <span className={getRiskLevel(healthMetrics.diabetesRisk).color}>
                      {getRiskLevel(healthMetrics.diabetesRisk).label}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Heart Disease Risk</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${healthMetrics.heartRisk}%` }}
                      ></div>
                    </div>
                    <span className={getRiskLevel(healthMetrics.heartRisk).color}>
                      {getRiskLevel(healthMetrics.heartRisk).label}
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-gray-500">Last Updated</h3>
                  <p className="font-medium">{formatDate(healthMetrics.lastUpdated)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                No health data yet. Complete your risk assessment to get started.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleStartAssessment} className="w-full">
              {healthMetrics.diabetesRisk !== null ? "Update Assessment" : "Start Assessment"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Personalized health insights</CardDescription>
          </CardHeader>
          <CardContent>
            {healthMetrics.diabetesRisk !== null && healthMetrics.recommendations?.length ? (
              <div className="space-y-2">
                {healthMetrics.recommendations.map((recommendation, index) => (
                  <div key={index} className="bg-primary/10 p-3 rounded-md">
                    <p className="text-sm text-gray-600">{recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                Complete your health profile to receive personalized recommendations.
              </p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={handleUpdateProfile} className="w-full">Update Profile</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

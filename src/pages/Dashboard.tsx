
import { useEffect, useState } from "react";
import { BarChart, LineChart, Layers, Users, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import CommunityMap from "@/components/CommunityMap";
import { TrendChart } from "@/components/TrendChart";
import RiskBreakdown from "@/components/RiskBreakdown";
import LLMInsights from "@/components/LLMInsights";

const mockCommunityData = [
  { id: 1, name: "Westside District", riskScore: 87, population: 14500, trends: "Increasing" },
  { id: 2, name: "North County", riskScore: 63, population: 28700, trends: "Stable" },
  { id: 3, name: "Eastview", riskScore: 41, population: 19200, trends: "Decreasing" },
  { id: 4, name: "Southgate", riskScore: 75, population: 12800, trends: "Increasing" },
  { id: 5, name: "Central Park Area", riskScore: 52, population: 22300, trends: "Stable" },
];

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Risk Dashboard</h1>
          <p className="text-muted-foreground">
            Visual insights into community health risks and resource needs
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-health-600 hover:bg-health-700" : ""}
          >
            All Risks
          </Button>
          <Button
            variant={activeFilter === "diabetes" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("diabetes")}
            className={activeFilter === "diabetes" ? "bg-health-600 hover:bg-health-700" : ""}
          >
            Diabetes
          </Button>
          <Button
            variant={activeFilter === "heart" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("heart")}
            className={activeFilter === "heart" ? "bg-health-600 hover:bg-health-700" : ""}
          >
            Heart Disease
          </Button>
          <Button
            variant={activeFilter === "respiratory" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter("respiratory")}
            className={activeFilter === "respiratory" ? "bg-health-600 hover:bg-health-700" : ""}
          >
            Respiratory
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">High Risk Communities</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-sm text-muted-foreground">Communities need immediate attention</p>
            <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
              <div className="h-1 bg-health-600 w-3/5 rounded-full" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>0 communities</span>
              <span>5 communities</span>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">At-Risk Population</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">27,300</div>
            <p className="text-sm text-muted-foreground">People in high-risk communities</p>
            <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
              <div className="h-1 bg-health-600 w-2/5 rounded-full" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>0 people</span>
              <span>100,000 people</span>
            </div>
          </CardContent>
        </Card>
        <Card className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Resource Coverage</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">48%</div>
            <p className="text-sm text-muted-foreground">Of high-risk areas have adequate resources</p>
            <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
              <div className="h-1 bg-amber-500 w-1/2 rounded-full" />
            </div>
            <div className="mt-2 text-xs text-muted-foreground flex justify-between">
              <span>0%</span>
              <span>100%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Risk Map</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Risk Breakdown</TabsTrigger>
          <TabsTrigger value="insights">LLM Insights</TabsTrigger>
        </TabsList>
        <TabsContent value="map" className="space-y-6">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Community Risk Heatmap</CardTitle>
              <CardDescription>
                Geographic visualization of community health risks
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] p-0">
              <CommunityMap isLoading={isLoading} />
            </CardContent>
          </Card>
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Communities at Risk</CardTitle>
              <CardDescription>
                Communities ranked by risk score based on LLM analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-left">Community</th>
                      <th className="py-3 px-4 text-center">Population</th>
                      <th className="py-3 px-4 text-center">Risk Score</th>
                      <th className="py-3 px-4 text-center">Risk Level</th>
                      <th className="py-3 px-4 text-center">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockCommunityData.map((community) => (
                      <tr key={community.id} className="border-b">
                        <td className="py-3 px-4">{community.name}</td>
                        <td className="py-3 px-4 text-center">{community.population.toLocaleString()}</td>
                        <td className="py-3 px-4 text-center">{community.riskScore}/100</td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center">
                            <div className={`h-3 w-3 rounded-full ${getStatusColor(community.riskScore)}`} />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            variant="outline"
                            className={
                              community.trends === "Increasing"
                                ? "border-red-500 text-red-500"
                                : community.trends === "Decreasing"
                                ? "border-green-500 text-green-500"
                                : "border-amber-500 text-amber-500"
                            }
                          >
                            {community.trends}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Risk Trends Over Time</CardTitle>
              <CardDescription>
                Analyze how community risks have changed over the past 12 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] p-6">
              <TrendChart />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="breakdown">
          <Card className="dashboard-card">
            <CardHeader>
              <CardTitle>Risk Factors Breakdown</CardTitle>
              <CardDescription>
                Analysis of key health risk factors in communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RiskBreakdown isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="insights">
          <Card className="dashboard-card">
            <CardHeader className="flex flex-row items-center space-x-2">
              <CardTitle>LLM-Generated Insights</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={16} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      These insights are automatically generated by analyzing various text data sources
                      including health reports, social media, and community feedback.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent>
              <LLMInsights isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
            <CardTitle className="text-amber-800 dark:text-amber-400 text-sm font-medium">Data Notice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800/80 dark:text-amber-400/80">
            This dashboard uses synthetic data for demonstration purposes. In a real-world implementation,
            data would be sourced from actual health records, community surveys, and other data sources.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

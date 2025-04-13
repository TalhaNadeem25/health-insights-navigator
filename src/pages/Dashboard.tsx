import { useEffect, useState } from "react";
import { BarChart, LineChart, Layers, Users, AlertTriangle, Info, AlertCircle, FileUp, TrendingUp, Activity, Map, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CommunityMap } from "@/components/CommunityMap";
import { TrendChart } from "@/components/TrendChart";
import RiskBreakdown from "@/components/RiskBreakdown";
import LLMInsights from "@/components/LLMInsights";
import { healthDataService } from "@/lib/healthDataService";
import { CommunityData, CommunityInsight, HealthTrend, RiskFactor } from "@/types/health";
import { Loader2 } from "lucide-react";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchHealthNews, NewsArticle } from '@/lib/newsService';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [communityData, setCommunityData] = useState<CommunityData[]>([]);
  const [healthTrends, setHealthTrends] = useState<HealthTrend[]>([]);
  const [riskFactors, setRiskFactors] = useState<RiskFactor[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [healthNews, setHealthNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [communities, trends, factors] = await Promise.all([
          healthDataService.getCommunityData(),
          healthDataService.getHealthTrends(),
          healthDataService.getRiskFactors()
        ]);

        setCommunityData(communities);
        setHealthTrends(trends);
        setRiskFactors(factors);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch health data');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    loadHealthNews();
  }, []);

  const loadHealthNews = async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const newsData = await fetchHealthNews();
      setHealthNews(newsData);
    } catch (error) {
      setNewsError('Failed to load health news');
      console.error('Error loading health news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const getStatusColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-green-500";
  };

  const getHighRiskCommunities = () => {
    return communityData.filter(community => community.riskScore >= 75).length;
  };

  const getAtRiskPopulation = () => {
    return communityData
      .filter(community => community.riskScore >= 75)
      .reduce((total, community) => total + community.population, 0);
  };

  const getResourceCoverage = () => {
    const highRiskCommunities = communityData.filter(community => community.riskScore >= 75);
    const coveredCommunities = highRiskCommunities.filter(community => 
      community.riskFactors.every(factor => factor.value < 0.7)
    );
    return (coveredCommunities.length / highRiskCommunities.length) * 100;
  };

  const generateInsights = (): CommunityInsight[] => {
    if (!communityData.length || !riskFactors.length) return [];
    
    // Generate insights based on community data and risk factors
    const insights: CommunityInsight[] = [];
    
    // Example insight for high-risk communities
    const highRiskCommunities = communityData.filter(community => community.riskScore >= 75);
    if (highRiskCommunities.length > 0) {
      insights.push({
        communityId: "all",
        type: "risk",
        title: "High Risk Communities Identified",
        description: `${highRiskCommunities.length} communities have been identified as high-risk areas with risk scores above 75%.`,
        confidence: 0.95,
        generationDate: new Date().toISOString(),
        recommendations: [
          "Increase healthcare resource allocation to these communities",
          "Implement targeted health education programs",
          "Conduct detailed health assessments"
        ],
        sources: ["Community Health Data", "Risk Assessment Reports"]
      });
    }
    
    // Example insight for risk factors
    const topRiskFactor = riskFactors.reduce((prev, current) => 
      (current.value > prev.value) ? current : prev
    );
    
    if (topRiskFactor) {
      insights.push({
        communityId: "all",
        type: "trend",
        title: `Primary Health Risk: ${topRiskFactor.type}`,
        description: `${topRiskFactor.type} is the most significant health risk factor across communities with a value of ${Math.round(topRiskFactor.value * 100)}%.`,
        confidence: 0.9,
        generationDate: new Date().toISOString(),
        recommendations: [
          `Develop targeted interventions for ${topRiskFactor.type}`,
          "Monitor trends and adjust strategies accordingly"
        ],
        sources: ["Risk Factor Analysis", "Health Trend Data"]
      });
    }
    
    return insights;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Handle file upload logic here
      console.log('File uploaded:', selectedFile.name);
    } catch (err) {
      setError('Failed to upload file');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderNewsCard = (article: NewsArticle) => (
    <Card key={article.url} className="mb-4">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-lg">{article.title}</h3>
          <p className="text-sm text-muted-foreground">{article.description}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted-foreground">{article.source.name}</span>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Read more
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderNewsSection = (category: NewsArticle['category']) => {
    const filteredNews = healthNews.filter(article => article.category === category);
    
    if (newsLoading) {
      return (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      );
    }

    if (newsError) {
      return (
        <div className="text-red-500 p-4">
          {newsError}
          <Button variant="outline" onClick={loadHealthNews} className="ml-2">
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredNews.map((article) => (
          <Card key={article.url} className="hover:bg-gray-50 transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <CardDescription>{article.source.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{article.description}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block"
              >
                Read more
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Risk Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time insights into community health risks and resource needs
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-health-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">High Risk Communities</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{getHighRiskCommunities()}</div>
                <p className="text-sm text-muted-foreground">Communities need immediate attention</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div 
                    className="h-1 bg-health-600 rounded-full" 
                    style={{ width: `${(getHighRiskCommunities() / communityData.length) * 100}%` }} 
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                  <span>0 communities</span>
                  <span>{communityData.length} communities</span>
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">At-Risk Population</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{getAtRiskPopulation().toLocaleString()}</div>
                <p className="text-sm text-muted-foreground">People in high-risk communities</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div 
                    className="h-1 bg-health-600 rounded-full" 
                    style={{ width: `${(getAtRiskPopulation() / communityData.reduce((total, community) => total + community.population, 0)) * 100}%` }} 
                  />
                </div>
                <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                  <span>0 people</span>
                  <span>{communityData.reduce((total, community) => total + community.population, 0).toLocaleString()} people</span>
                </div>
              </CardContent>
            </Card>
            <Card className="dashboard-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Resource Coverage</CardTitle>
                <Layers className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(getResourceCoverage())}%</div>
                <p className="text-sm text-muted-foreground">Of high-risk areas have adequate resources</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div 
                    className="h-1 bg-amber-500 rounded-full" 
                    style={{ width: `${getResourceCoverage()}%` }} 
                  />
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
                  <CommunityMap 
                    isLoading={isLoading} 
                    communities={communityData}
                  />
                </CardContent>
              </Card>
              <Card className="dashboard-card">
                <CardHeader>
                  <CardTitle>Communities at Risk</CardTitle>
                  <CardDescription>
                    Communities ranked by risk score based on real-time data
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
                        {communityData.map((community) => (
                          <tr key={community.id} className="border-b">
                            <td className="py-3 px-4">{community.name}</td>
                            <td className="py-3 px-4 text-center">{community.population.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">{Math.round(community.riskScore)}/100</td>
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
                    Analyze how community risks have changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[500px] p-6">
                  <TrendChart data={healthTrends} />
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
                  <RiskBreakdown 
                    isLoading={isLoading} 
                    riskFactors={riskFactors}
                    communityData={communityData}
                  />
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
                          These insights are generated by analyzing real health data from various sources
                          including health records, community surveys, and medical reports.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardHeader>
                <CardContent>
                  <LLMInsights 
                    isLoading={isLoading} 
                    insights={generateInsights()}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card className="border-health-200 bg-health-50 dark:bg-health-950/20">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-health-600 mr-2" />
                <CardTitle className="text-health-800 dark:text-health-400 text-sm font-medium">Data Sources</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-health-800/80 dark:text-health-400/80">
                This dashboard uses real-time data from health records, community surveys, and medical reports.
                Data is updated regularly to ensure accurate risk assessment and resource allocation.
              </p>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">
                      +2 from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">7.2</div>
                    <p className="text-xs text-muted-foreground">
                      -0.3 from last week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24</div>
                    <p className="text-xs text-muted-foreground">
                      +4 new reports
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Map Coverage</CardTitle>
                    <Map className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">85%</div>
                    <p className="text-xs text-muted-foreground">
                      +5% coverage increase
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Risk Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthNews
                          .filter(article => article.category === 'disease' || article.category === 'healthcare')
                          .slice(0, 3)
                          .map(renderNewsCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Risk Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthNews
                          .filter(article => article.category === 'policy' || article.category === 'research')
                          .slice(0, 3)
                          .map(renderNewsCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Healthcare Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthNews
                          .filter(article => article.category === 'healthcare')
                          .slice(0, 3)
                          .map(renderNewsCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Research Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthNews
                          .filter(article => article.category === 'research')
                          .slice(0, 3)
                          .map(renderNewsCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Policy Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthNews
                          .filter(article => article.category === 'policy')
                          .slice(0, 3)
                          .map(renderNewsCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Disease Alerts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsLoading ? (
                      <div className="flex items-center justify-center h-48">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {healthNews
                          .filter(article => article.category === 'disease')
                          .slice(0, 3)
                          .map(renderNewsCard)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Dashboard;

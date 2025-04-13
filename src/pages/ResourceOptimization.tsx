import { useState } from "react";
import { Brain, ArrowRight, FileText, Map, Users, Lightbulb, Calendar, ScrollText, Loader2, AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const mockRecommendations = [
  {
    id: 1,
    title: "Deploy Mobile Diabetes Screening Units to Westside District",
    description: "Analysis of community health data indicates high undiagnosed diabetes rates in the Westside District, particularly in areas with limited transportation access. Deploy mobile screening units on weekends at community centers and places of worship to maximize reach.",
    impact: "High",
    cost: "Medium",
    timeline: "1-2 months",
    dataPoints: ["75% of residents live >3 miles from healthcare facilities", "32% increase in diabetes-related comments in community feedback", "Mobile clinics showed 47% higher engagement in similar communities"],
    communityId: "westside"
  },
  {
    id: 2,
    title: "Launch Targeted Heart Health Awareness Campaign in Southgate",
    description: "Content analysis of social media and community forums reveals low awareness of heart disease risk factors in Southgate, despite high prevalence. Develop culturally-appropriate educational content addressing specific misconceptions identified in the text data.",
    impact: "Medium",
    cost: "Low",
    timeline: "2-4 weeks",
    dataPoints: ["58% of health discussions show misconceptions about heart disease", "Local influencers mentioned in 24% of community discussions", "Previous campaigns showed 3x engagement with targeted messaging"],
    communityId: "southgate"
  },
  {
    id: 3,
    title: "Establish Community Health Worker Program in North County",
    description: "Text analysis of health reports and community feedback indicates significant cultural barriers to healthcare access in North County's diverse population. Train and deploy community health workers from within these communities to build trust and provide culturally competent navigation assistance.",
    impact: "High",
    cost: "High",
    timeline: "3-6 months",
    dataPoints: ["42% of residents report language barriers in healthcare settings", "Community leaders mentioned as trusted sources in 67% of feedback", "Similar programs showed 35% increase in preventive care utilization"],
    communityId: "north"
  },
  {
    id: 4,
    title: "Create Medication Access Program for Elderly in Eastview",
    description: "Analysis of community needs assessments and social service reports reveals significant medication adherence issues among elderly residents in Eastview, primarily due to cost and transportation barriers. Implement a medication delivery service partnering with local pharmacies and volunteer groups.",
    impact: "Medium",
    cost: "Medium",
    timeline: "2-3 months",
    dataPoints: ["63% of seniors report medication adherence challenges", "Transportation mentioned as barrier in 41% of senior feedback", "Similar programs reduced hospital readmissions by 28%"],
    communityId: "eastview"
  },
];

const mockCampaignContent = {
  title: "Heart Health Awareness Campaign for Southgate Community",
  tagline: "Know Your Heart, Know Your Health",
  keyMessages: [
    "High blood pressure often has no symptoms - get checked regularly",
    "Small diet changes like reducing salt can make a big difference",
    "Just 30 minutes of walking daily can reduce your heart disease risk significantly",
    "Know your family history - it's a key risk factor for heart disease"
  ],
  channels: ["Community centers", "Social media (Facebook, WhatsApp groups)", "Local radio", "Places of worship"],
  materials: ["Infographics in multiple languages", "Short video testimonials from community members", "SMS message campaign", "Interactive risk assessment tool"],
  targetAudience: "Adults 40-70 years old in Southgate community, particularly in neighborhoods with limited healthcare access"
};

const ResourceOptimization = () => {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [campaignContent, setCampaignContent] = useState<typeof mockCampaignContent | null>(null);

  const filteredRecommendations = selectedCommunity === "all" 
    ? mockRecommendations 
    : mockRecommendations.filter(rec => rec.communityId === selectedCommunity);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Low": return "bg-amber-100 text-amber-800 border-amber-200";
      default: return "";
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case "High": return "bg-red-100 text-red-800 border-red-200";
      case "Medium": return "bg-amber-100 text-amber-800 border-amber-200";
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      default: return "";
    }
  };

  const handleGenerateCampaign = () => {
    setGeneratingCampaign(true);
    // Simulate API call to generate campaign content
    setTimeout(() => {
      setCampaignContent(mockCampaignContent);
      setGeneratingCampaign(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Resource Optimization</h1>
        <p className="text-muted-foreground">
          LLM-generated recommendations for optimal resource allocation based on health data analysis
        </p>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommendations">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="generator">
            <ScrollText className="h-4 w-4 mr-2" />
            Campaign Generator
          </TabsTrigger>
        </TabsList>
        <TabsContent value="recommendations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-health-600" />
                  <CardTitle>LLM-Generated Resource Recommendations</CardTitle>
                </div>
                <CardDescription>
                  AI-powered recommendations based on analysis of health data and community insights
                </CardDescription>

                <div className="mt-4">
                  <Label htmlFor="community-filter">Filter by Community:</Label>
                  <Select
                    value={selectedCommunity}
                    onValueChange={setSelectedCommunity}
                  >
                    <SelectTrigger className="w-full sm:w-[250px] mt-1">
                      <SelectValue placeholder="Select community" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Communities</SelectItem>
                      <SelectItem value="westside">Westside District</SelectItem>
                      <SelectItem value="southgate">Southgate</SelectItem>
                      <SelectItem value="north">North County</SelectItem>
                      <SelectItem value="eastview">Eastview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {filteredRecommendations.map((recommendation) => (
                  <Card key={recommendation.id} className="dashboard-card border-l-4 border-l-health-600">
                    <CardHeader>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className={getImpactColor(recommendation.impact)}>
                            Impact: {recommendation.impact}
                          </Badge>
                          <Badge variant="outline" className={getCostColor(recommendation.cost)}>
                            Cost: {recommendation.cost}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            Timeline: {recommendation.timeline}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground">
                        {recommendation.description}
                      </p>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                          <FileText className="h-4 w-4 text-health-600" />
                          Supporting Data Points
                        </h4>
                        <ul className="list-disc list-inside space-y-1">
                          {recommendation.dataPoints.map((point, index) => (
                            <li key={index} className="text-sm text-muted-foreground">{point}</li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="border-t p-4 flex justify-end">
                      <Button variant="outline" size="sm">View Details</Button>
                    </CardFooter>
                  </Card>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Resource Allocation Priorities</CardTitle>
                <CardDescription>
                  Based on the AI analysis of community health needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Map className="h-4 w-4 text-health-600" />
                      Geographic Priorities
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Westside District</span>
                          <span className="text-sm">87%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "87%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Southgate</span>
                          <span className="text-sm">75%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "75%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">North County</span>
                          <span className="text-sm">63%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "63%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Eastview</span>
                          <span className="text-sm">52%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "52%" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-health-600" />
                      Health Issue Priorities
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Diabetes Management</span>
                          <span className="text-sm">82%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "82%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Heart Disease Prevention</span>
                          <span className="text-sm">78%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "78%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Mental Health Support</span>
                          <span className="text-sm">65%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "65%" }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Maternal & Child Health</span>
                          <span className="text-sm">58%</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-health-600" style={{ width: "58%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="generator">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-health-600" />
                  <CardTitle>LLM-Powered Campaign Generator</CardTitle>
                </div>
                <CardDescription>
                  Generate detailed health campaign content based on community needs analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campaign-type">Campaign Type</Label>
                      <Select defaultValue="awareness">
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="awareness">Awareness & Education</SelectItem>
                          <SelectItem value="screening">Screening & Prevention</SelectItem>
                          <SelectItem value="resources">Resource Access</SelectItem>
                          <SelectItem value="behavior">Behavior Change</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="health-focus">Health Focus</Label>
                      <Select defaultValue="heart">
                        <SelectTrigger>
                          <SelectValue placeholder="Select health focus" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="heart">Heart Disease</SelectItem>
                          <SelectItem value="diabetes">Diabetes</SelectItem>
                          <SelectItem value="mental">Mental Health</SelectItem>
                          <SelectItem value="maternal">Maternal & Child Health</SelectItem>
                          <SelectItem value="covid">COVID-19</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-community">Target Community</Label>
                      <Select defaultValue="southgate">
                        <SelectTrigger>
                          <SelectValue placeholder="Select target community" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="westside">Westside District</SelectItem>
                          <SelectItem value="southgate">Southgate</SelectItem>
                          <SelectItem value="north">North County</SelectItem>
                          <SelectItem value="eastview">Eastview</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-audience">Target Audience</Label>
                      <Select defaultValue="adults">
                        <SelectTrigger>
                          <SelectValue placeholder="Select target audience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">General Population</SelectItem>
                          <SelectItem value="seniors">Seniors (65+)</SelectItem>
                          <SelectItem value="adults">Adults (40-65)</SelectItem>
                          <SelectItem value="young">Young Adults (18-39)</SelectItem>
                          <SelectItem value="adolescents">Adolescents (13-17)</SelectItem>
                          <SelectItem value="children">Children (0-12)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-center">
                    <Button 
                      onClick={handleGenerateCampaign} 
                      disabled={generatingCampaign || campaignContent !== null}
                      className="bg-health-600 hover:bg-health-700"
                    >
                      {generatingCampaign ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating Campaign...
                        </>
                      ) : campaignContent !== null ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Campaign Generated
                        </>
                      ) : (
                        <>
                          <Brain className="mr-2 h-4 w-4" />
                          Generate Campaign Content
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {campaignContent && (
              <Card className="border-t-4 border-t-health-600">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-health-600" />
                    <CardTitle>{campaignContent.title}</CardTitle>
                  </div>
                  <CardDescription className="text-lg font-medium text-health-600 mt-2">
                    "{campaignContent.tagline}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-medium">Key Messages</h3>
                    <ul className="space-y-2">
                      {campaignContent.keyMessages.map((message, i) => (
                        <li key={i} className="flex items-start">
                          <div className="mr-3 h-6 w-6 rounded-full bg-health-600 text-white flex items-center justify-center text-sm flex-shrink-0">
                            {i + 1}
                          </div>
                          <span>{message}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Distribution Channels</h3>
                      <ul className="space-y-1">
                        {campaignContent.channels.map((channel, i) => (
                          <li key={i} className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-health-600" />
                            {channel}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Campaign Materials</h3>
                      <ul className="space-y-1">
                        {campaignContent.materials.map((material, i) => (
                          <li key={i} className="flex items-center">
                            <ArrowRight className="h-4 w-4 mr-2 text-health-600" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Target Audience</h3>
                    <p className="text-muted-foreground">{campaignContent.targetAudience}</p>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start">
                      <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-blue-800 dark:text-blue-400 font-medium mb-1">LLM Analysis Insight</h3>
                        <p className="text-blue-800/80 dark:text-blue-400/80 text-sm">
                          This campaign addresses the key findings from our text analysis of community health data, 
                          particularly the low awareness of heart disease risk factors (58% confusion rate in social media posts)
                          and the cultural barriers to healthcare access identified in Southgate.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 flex justify-end gap-3">
                  <Button variant="outline">Edit Campaign</Button>
                  <Button className="bg-health-600 hover:bg-health-700">Export Campaign</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResourceOptimization;

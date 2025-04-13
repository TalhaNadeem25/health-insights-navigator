
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Map } from "lucide-react";

const mockInsights = [
  {
    id: 1,
    title: "Mental Health Crisis in Westside District",
    description: "Text analysis of community feedback and social media indicates a significant increase in mental health concerns in the Westside District, particularly among young adults. Keywords like 'anxiety', 'depression', and 'counseling' have increased by 47% in the last quarter.",
    source: "Social Media Analysis",
    type: "emerging",
    actionable: true,
    community: "Westside District",
  },
  {
    id: 2,
    title: "Diabetes Management Resources Lacking in Southgate",
    description: "Analysis of patient feedback forms shows recurring mentions of difficulty accessing diabetes management resources in Southgate. 78% of diabetes-related comments express frustration about lack of affordable testing supplies and nutritional guidance.",
    source: "Patient Feedback",
    type: "critical",
    actionable: true,
    community: "Southgate",
  },
  {
    id: 3,
    title: "Growing Food Insecurity in North County",
    description: "Reports from community health workers and local news coverage indicate increasing food insecurity in North County, which may be contributing to poor nutrition outcomes. This correlates with a 23% increase in mentions of 'food banks' and 'meal assistance'.",
    source: "Community Reports",
    type: "trend",
    actionable: true,
    community: "North County",
  },
  {
    id: 4,
    title: "Positive Impact of Mobile Screening in Eastview",
    description: "Text analysis of community feedback shows positive sentiment around recent mobile screening initiatives in Eastview, with a 38% increase in preventive care engagement. This suggests similar programs could be effective in other underserved areas.",
    source: "Program Feedback",
    type: "insight",
    actionable: false,
    community: "Eastview",
  },
];

interface LLMInsightsProps {
  isLoading: boolean;
}

const LLMInsights = ({ isLoading }: LLMInsightsProps) => {
  const [insights, setInsights] = useState<typeof mockInsights>([]);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setInsights(mockInsights);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emerging":
        return <TrendingUp className="h-4 w-4" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4" />;
      case "trend":
        return <Lightbulb className="h-4 w-4" />;
      case "insight":
        return <Brain className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "emerging":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "trend":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "insight":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {insights.map((insight) => (
        <Card key={insight.id} className="overflow-hidden border-l-4 border-l-health-600">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg">{insight.title}</h3>
                <Badge
                  variant="outline"
                  className={`flex items-center gap-1 ${getTypeColor(insight.type)}`}
                >
                  {getTypeIcon(insight.type)}
                  <span className="capitalize">{insight.type}</span>
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{insight.description}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Source: {insight.source}
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Map className="h-3 w-3" />
                  {insight.community}
                </Badge>
                {insight.actionable && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                    Actionable
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex justify-center">
        <div className="text-muted-foreground text-sm flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>Insights generated by LLM analysis of text data</span>
        </div>
      </div>
    </div>
  );
};

export default LLMInsights;

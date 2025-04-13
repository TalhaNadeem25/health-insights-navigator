import { CommunityInsight } from "@/types/health";
import { Loader2, Lightbulb, TrendingUp, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LLMInsightsProps {
  isLoading: boolean;
  insights: CommunityInsight[];
}

const LLMInsights = ({ isLoading, insights }: LLMInsightsProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-health-600" />
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Info className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No insights available</p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Insights will appear here once they are generated from community health data
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "trend":
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case "risk":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "opportunity":
        return <Lightbulb className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    let color = "bg-gray-500";
    if (confidence >= 0.8) {
      color = "bg-green-500";
    } else if (confidence >= 0.6) {
      color = "bg-blue-500";
    } else if (confidence >= 0.4) {
      color = "bg-amber-500";
    } else {
      color = "bg-red-500";
    }
    return (
      <Badge variant="secondary" className={color}>
        {Math.round(confidence * 100)}% Confidence
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {insights.map((data, index) => (
        <Card key={index} className="overflow-hidden">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getInsightIcon(data.type)}
                <CardTitle className="text-lg">{data.title}</CardTitle>
              </div>
              {getConfidenceBadge(data.confidence)}
            </div>
            <CardDescription>
              Generated on {new Date(data.generationDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p>{data.description}</p>
            </div>
            {data.recommendations && data.recommendations.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h4 className="font-medium">Recommendations:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {data.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
            {data.sources && data.sources.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-2">
                  <h4 className="font-medium">Sources:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {data.sources.map((source, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground">
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LLMInsights;

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { geminiAnalyzeHealth, getGeminiApiKey } from "@/lib/gemini";
import { Loader2, Brain, AlertTriangle, Activity, Heart, Thermometer, Clock, Stethoscope, Pill, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const HealthReportAnalyzer = () => {
  const [healthReport, setHealthReport] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<{
    risks: string[];
    recommendations: string[];
    severity: "low" | "medium" | "high";
    symptoms?: string[];
    conditions?: string[];
    immediateActions?: string[];
    preventiveMeasures?: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeReport = async () => {
    if (!healthReport.trim()) {
      toast({
        title: "Empty Report",
        description: "Please enter your health report before analyzing",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        toast({
          title: "API Key Required",
          description: "Please set up your Gemini API key first",
          variant: "destructive",
        });
        return;
      }

      const result = await geminiAnalyzeHealth({
        freeFormReport: healthReport,
      });

      if (!result.success) {
        setError(result.analysis);
        toast({
          title: "Analysis Failed",
          description: result.analysis,
          variant: "destructive",
        });
        return;
      }

      // Parse the analysis to extract different components
      const analysisText = result.analysis;
      
      // Extract risks
      const risks = analysisText
        .split("\n")
        .filter(line => line.toLowerCase().includes("risk"))
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      // Extract recommendations
      const recommendations = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("recommend") || 
          line.toLowerCase().includes("suggest") ||
          line.toLowerCase().includes("advise")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      // Extract symptoms
      const symptoms = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("symptom") || 
          line.toLowerCase().includes("experiencing") ||
          line.toLowerCase().includes("feeling")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      // Extract conditions
      const conditions = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("condition") || 
          line.toLowerCase().includes("diagnosis") ||
          line.toLowerCase().includes("disease")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      // Extract immediate actions
      const immediateActions = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("immediate") || 
          line.toLowerCase().includes("urgent") ||
          line.toLowerCase().includes("emergency")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      // Extract preventive measures
      const preventiveMeasures = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("prevent") || 
          line.toLowerCase().includes("avoid") ||
          line.toLowerCase().includes("reduce risk")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());

      // Determine severity based on risk scores
      const severity = 
        result.diabetesRisk > 75 || result.heartRisk > 75 ? "high" :
        result.diabetesRisk > 50 || result.heartRisk > 50 ? "medium" : "low";

      setAnalysis({
        risks: risks.length > 0 ? risks : ["No specific risks identified"],
        recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations provided"],
        severity,
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        conditions: conditions.length > 0 ? conditions : undefined,
        immediateActions: immediateActions.length > 0 ? immediateActions : undefined,
        preventiveMeasures: preventiveMeasures.length > 0 ? preventiveMeasures : undefined,
      });

      toast({
        title: "Analysis Complete",
        description: "Your health report has been analyzed successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error analyzing health report:", error);
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      toast({
        title: "Analysis Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-500";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "";
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
      default:
        return "";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High Risk</Badge>;
      case "medium":
        return <Badge variant="warning">Medium Risk</Badge>;
      case "low":
        return <Badge variant="success">Low Risk</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-health-600" />
          Free-Form Health Report Analysis
        </CardTitle>
        <CardDescription>
          Describe your health concerns, symptoms, or medical conditions, and our AI will analyze potential health risks and provide medical recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Example: I am 9 years old, experiencing fever of 101°F, cough, and fatigue for the past 3 days..."
            value={healthReport}
            onChange={(e) => setHealthReport(e.target.value)}
            className="min-h-[150px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            For best results, include: symptoms, duration, severity, any existing conditions, medications, and relevant family history.
          </p>
        </div>
        
        <Button 
          onClick={analyzeReport} 
          disabled={isAnalyzing || !healthReport.trim()}
          className="w-full bg-health-600 hover:bg-health-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing your health report...
            </>
          ) : (
            "Analyze Health Report"
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Analysis Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="space-y-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className={`h-5 w-5 ${getSeverityColor(analysis.severity)}`} />
                <h3 className="font-medium text-lg">Health Risk Assessment</h3>
              </div>
              {getSeverityBadge(analysis.severity)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Risk Level</span>
                <span className={getSeverityColor(analysis.severity)}>
                  {analysis.severity.toUpperCase()}
                </span>
              </div>
              <Progress 
                value={
                  analysis.severity === "high" ? 100 : 
                  analysis.severity === "medium" ? 65 : 30
                } 
                className={`h-2 ${getSeverityBgColor(analysis.severity)}`}
              />
            </div>
            
            <Separator />
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4 pt-4">
                {analysis.symptoms && analysis.symptoms.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4 text-health-600" />
                      <h3 className="font-medium">Identified Symptoms</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.symptoms.map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.conditions && analysis.conditions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-health-600" />
                      <h3 className="font-medium">Potential Conditions</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.conditions.map((condition, index) => (
                        <li key={index}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.immediateActions && analysis.immediateActions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-500" />
                      <h3 className="font-medium">Immediate Actions</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.immediateActions.map((action, index) => (
                        <li key={index}>{action}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="risks" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-health-600" />
                    <h3 className="font-medium">Health Risks</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.risks.map((risk, index) => (
                      <li key={index}>{risk}</li>
                    ))}
                  </ul>
                </div>
                
                {analysis.preventiveMeasures && analysis.preventiveMeasures.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-health-600" />
                      <h3 className="font-medium">Preventive Measures</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      {analysis.preventiveMeasures.map((measure, index) => (
                        <li key={index}>{measure}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-health-600" />
                    <h3 className="font-medium">Medical Recommendations</h3>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
            
            <Alert className="bg-muted/50 border-health-200">
              <Pill className="h-4 w-4 text-health-600" />
              <AlertTitle>Medical Disclaimer</AlertTitle>
              <AlertDescription>
                This analysis was generated by AI and is for informational purposes only. 
                Always consult healthcare professionals before making medical decisions.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          Note: This analysis is for informational purposes only. Always consult healthcare professionals for medical advice.
        </p>
      </CardFooter>
    </Card>
  );
}; 
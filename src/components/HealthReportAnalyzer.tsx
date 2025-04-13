import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { geminiAnalyzeHealth, getGeminiApiKey } from "@/lib/gemini";
import { Loader2, Brain, AlertTriangle, Activity, Heart, Thermometer, Clock, Stethoscope, Pill, Shield, Sparkles, Microscope, TrendingUp, BookOpen, Phone, MapPin, Link } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import debounce from "lodash/debounce";

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
    predictiveInsights?: {
      potentialDiseases: Array<{
        name: string;
        probability: number;
        description: string;
        earlySymptoms: string[];
      }>;
      riskFactors: string[];
      timeframe: string;
    };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const analyzeReport = useCallback(async (text: string) => {
    if (!text.trim()) {
      setAnalysis(null);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    
    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        setError("API key required. Please set up your Gemini API key first.");
        return;
      }

      const result = await geminiAnalyzeHealth({
        freeFormReport: text,
      });

      if (!result.success) {
        setError(result.analysis);
        return;
      }

      const analysisText = result.analysis;
      
      const risks = analysisText
        .split("\n")
        .filter(line => line.toLowerCase().includes("risk"))
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      const recommendations = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("recommend") || 
          line.toLowerCase().includes("suggest") ||
          line.toLowerCase().includes("advise")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      const symptoms = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("symptom") || 
          line.toLowerCase().includes("experiencing") ||
          line.toLowerCase().includes("feeling")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      const conditions = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("condition") || 
          line.toLowerCase().includes("diagnosis") ||
          line.toLowerCase().includes("disease")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      const immediateActions = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("immediate") || 
          line.toLowerCase().includes("urgent") ||
          line.toLowerCase().includes("emergency")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());
      
      const preventiveMeasures = analysisText
        .split("\n")
        .filter(line => 
          line.toLowerCase().includes("prevent") || 
          line.toLowerCase().includes("avoid") ||
          line.toLowerCase().includes("reduce risk")
        )
        .map(line => line.replace(/^[-•*]\s*/, "").trim());

      const severity = 
        result.diabetesRisk > 75 || result.heartRisk > 75 ? "high" :
        result.diabetesRisk > 50 || result.heartRisk > 50 ? "medium" : "low";

      // Add predictive insights analysis
      const predictiveInsights = {
        potentialDiseases: analysisText
          .split("\n")
          .filter(line => 
            line.toLowerCase().includes("potential") || 
            line.toLowerCase().includes("likely") ||
            line.toLowerCase().includes("possible")
          )
          .map(line => {
            const diseaseName = line.match(/(?:potential|likely|possible)\s+(.+?)(?:\s+\(|:|\.|$)/i)?.[1] || "";
            const probability = line.match(/(\d+)%/)?.[1] ? parseInt(line.match(/(\d+)%/)[1]) : 50;
            const description = line.replace(/^[-•*]\s*/, "").trim();
            const earlySymptoms = line.match(/early symptoms?:?\s+(.+)/i)?.[1]?.split(",").map(s => s.trim()) || [];
            return {
              name: diseaseName,
              probability,
              description,
              earlySymptoms
            };
          })
          .filter(disease => disease.name),
        riskFactors: analysisText
          .split("\n")
          .filter(line => line.toLowerCase().includes("risk factor"))
          .map(line => line.replace(/^[-•*]\s*/, "").trim()),
        timeframe: analysisText
          .split("\n")
          .find(line => line.toLowerCase().includes("timeline") || line.toLowerCase().includes("timeframe"))
          ?.replace(/^[-•*]\s*/, "").trim() || "Short to medium term"
      };

      setAnalysis({
        risks: risks.length > 0 ? risks : ["No specific risks identified"],
        recommendations: recommendations.length > 0 ? recommendations : ["No specific recommendations provided"],
        severity,
        symptoms: symptoms.length > 0 ? symptoms : undefined,
        conditions: conditions.length > 0 ? conditions : undefined,
        immediateActions: immediateActions.length > 0 ? immediateActions : undefined,
        preventiveMeasures: preventiveMeasures.length > 0 ? preventiveMeasures : undefined,
        predictiveInsights: predictiveInsights.potentialDiseases.length > 0 ? predictiveInsights : undefined,
      });
    } catch (error) {
      setError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Create a debounced version of analyzeReport
  const debouncedAnalyze = useCallback(
    debounce((text: string) => analyzeReport(text), 1000),
    [analyzeReport]
  );

  // Effect to trigger analysis when text changes
  useEffect(() => {
    if (healthReport.trim().length > 50) { // Only analyze if there's substantial text
      debouncedAnalyze(healthReport);
    }
    return () => {
      debouncedAnalyze.cancel();
    };
  }, [healthReport, debouncedAnalyze]);

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

  // const getSeverityBadge = (severity: string) => {
  //   switch (severity) {
  //     case "high":
  //       return <Badge variant="destructive">High Risk</Badge>;
  //     case "medium":
  //       return <Badge variant="secondary">Medium Risk</Badge>;
  //     case "low":
  //       return <Badge variant="outline">Low Risk</Badge>;
  //     default:
  //       return null;
  //   }
  // };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-health-50/90 to-white/95 dark:from-gray-900/90 dark:to-gray-800/95 backdrop-blur-lg border-health-200/50 shadow-xl">
      <CardHeader className="space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="h-8 w-8 text-health-600" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-health-600 to-health-400 bg-clip-text text-transparent">
                AI Health Analysis
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                Powered by Advanced Medical AI
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 border-health-200 text-health-600">
            v2.0
          </Badge>
        </div>
        <CardDescription className="text-base leading-relaxed">
          Input your health data below for an instant AI-powered analysis. Our system processes symptoms, 
          medical history, and vital signs to provide comprehensive health insights.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-health-200 via-health-400 to-health-600 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative">
            <Textarea
              placeholder="Example: I am 9 years old, experiencing fever of 101°F, cough, and fatigue for the past 3 days..."
              value={healthReport}
              onChange={(e) => setHealthReport(e.target.value)}
              className="min-h-[200px] resize-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-health-200/50 focus:border-health-400 focus:ring-health-400 transition-all duration-300"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-4 w-4" />
              AI Ready
            </div>
          </div>
        </div>

        <Button 
          onClick={() => {
            if (healthReport.trim()) {
              debouncedAnalyze(healthReport);
            }
          }} 
          disabled={isAnalyzing || !healthReport.trim()}
          className="w-full bg-gradient-to-r from-health-600 to-health-400 hover:from-health-700 hover:to-health-500 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-6 text-lg font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Health Data...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Analyze Health Report
            </>
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle className="text-lg font-semibold">Analysis Error</AlertTitle>
            <AlertDescription className="mt-2">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="space-y-8 mt-8 animate-fadeIn">
            <div className="flex items-center justify-between bg-gradient-to-r from-health-50 to-white dark:from-gray-900 dark:to-gray-800 p-4 rounded-lg border border-health-200/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-md">
                  <Activity className={`h-6 w-6 ${getSeverityColor(analysis.severity)}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-xl">Risk Assessment</h3>
                  <p className="text-sm text-muted-foreground">Based on provided health data</p>
                </div>
              </div>
              {/* <div>
                {getSeverityBadge(analysis.severity)}
              </div> */}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-health-50 to-white dark:from-gray-900 dark:to-gray-800 p-1 rounded-lg">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-health-600">Overview</TabsTrigger>
                <TabsTrigger value="risks" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-health-600">Risks</TabsTrigger>
                <TabsTrigger value="predictions" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-health-600">Predictions</TabsTrigger>
                <TabsTrigger value="recommendations" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-health-600">Recommendations</TabsTrigger>
                <TabsTrigger value="resources" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-health-600">Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 pt-6">
                {analysis.symptoms && analysis.symptoms.length > 0 && (
                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <Thermometer className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Identified Symptoms</h3>
                    </div>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {analysis.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.conditions && analysis.conditions.length > 0 && (
                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <Stethoscope className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Potential Conditions</h3>
                    </div>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {analysis.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {analysis.immediateActions && analysis.immediateActions.length > 0 && (
                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <Clock className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Immediate Actions</h3>
                    </div>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {analysis.immediateActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="risks" className="space-y-6 pt-6">
                <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-health-50 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-health-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Health Risks</h3>
                  </div>
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {analysis.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {analysis.preventiveMeasures && analysis.preventiveMeasures.length > 0 && (
                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <Shield className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Preventive Measures</h3>
                    </div>
                    <ul className="grid gap-2 text-sm text-muted-foreground">
                      {analysis.preventiveMeasures.map((measure, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                          {measure}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="predictions" className="space-y-6 pt-6">
                {analysis?.predictiveInsights ? (
                  <>
                    <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-health-50 rounded-full">
                            <Microscope className="h-5 w-5 text-health-600" />
                          </div>
                          <h3 className="font-semibold text-lg">Potential Health Conditions</h3>
                        </div>
                        <Badge variant="outline" className="bg-health-50/50">
                          {analysis.predictiveInsights.timeframe}
                        </Badge>
                      </div>
                      
                      <div className="grid gap-4 mt-4">
                        {analysis.predictiveInsights.potentialDiseases.map((disease, index) => (
                          <div key={index} className="bg-white/80 dark:bg-gray-900/80 p-4 rounded-lg border border-health-100">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-health-700 dark:text-health-300">{disease.name}</h4>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-health-500" />
                                <span className="text-sm font-medium text-health-600">{disease.probability}% probability</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{disease.description}</p>
                            {disease.earlySymptoms.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-health-600">Early Warning Signs:</p>
                                <div className="flex flex-wrap gap-2">
                                  {disease.earlySymptoms.map((symptom, idx) => (
                                    <Badge key={idx} variant="secondary" className="bg-health-50 text-health-700">
                                      {symptom}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {analysis.predictiveInsights.riskFactors.length > 0 && (
                      <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-health-50 rounded-full">
                            <AlertTriangle className="h-5 w-5 text-health-600" />
                          </div>
                          <h3 className="font-semibold text-lg">Contributing Risk Factors</h3>
                        </div>
                        <ul className="grid gap-2 text-sm text-muted-foreground">
                          {analysis.predictiveInsights.riskFactors.map((factor, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No predictive insights available for the provided health data.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-6 pt-6">
                <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-health-50 rounded-full">
                      <Heart className="h-5 w-5 text-health-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Medical Recommendations</h3>
                  </div>
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-health-400 shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6 pt-6">
                <div className="space-y-6">
                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <Phone className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Emergency Contacts</h3>
                    </div>
                    <div className="grid gap-3">
                      <div className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100">
                        <div className="font-medium text-health-700">Emergency Services</div>
                        <div className="text-lg font-bold">911</div>
                      </div>
                      <div className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100">
                        <div className="font-medium text-health-700">Poison Control</div>
                        <div className="text-lg font-bold">1-800-222-1222</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <BookOpen className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Educational Resources</h3>
                    </div>
                    <div className="grid gap-3">
                      {analysis?.conditions?.map((condition, index) => (
                        <a
                          key={index}
                          href={`https://medlineplus.gov/search.html?q=${encodeURIComponent(condition)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100 hover:bg-health-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-health-700">{condition}</div>
                            <Link className="h-4 w-4 text-health-500" />
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Learn more about this condition on MedlinePlus</div>
                        </a>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <MapPin className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Find Healthcare Providers</h3>
                    </div>
                    <div className="grid gap-3">
                      <a
                        href="https://findahealthcenter.hrsa.gov/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100 hover:bg-health-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-health-700">Find a Health Center</div>
                          <Link className="h-4 w-4 text-health-500" />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Locate nearby healthcare facilities and clinics</div>
                      </a>
                      <a
                        href="https://www.medicare.gov/care-compare"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100 hover:bg-health-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-health-700">Care Compare</div>
                          <Link className="h-4 w-4 text-health-500" />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">Compare healthcare providers and facilities</div>
                      </a>
                    </div>
                  </div>

                  <div className="space-y-3 bg-white/50 dark:bg-gray-800/50 p-4 rounded-lg border border-health-200/50">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-health-50 rounded-full">
                        <Heart className="h-5 w-5 text-health-600" />
                      </div>
                      <h3 className="font-semibold text-lg">Support Services</h3>
                    </div>
                    <div className="grid gap-3">
                      <a
                        href="https://www.samhsa.gov/find-help/national-helpline"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100 hover:bg-health-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-health-700">SAMHSA's National Helpline</div>
                          <Link className="h-4 w-4 text-health-500" />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">1-800-662-4357 - 24/7 treatment referral and information</div>
                      </a>
                      <a
                        href="https://988lifeline.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/80 dark:bg-gray-900/80 p-3 rounded-md border border-health-100 hover:bg-health-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-health-700">988 Suicide & Crisis Lifeline</div>
                          <Link className="h-4 w-4 text-health-500" />
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">988 - 24/7 crisis support</div>
                      </a>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Alert className="bg-gradient-to-r from-blue-50 to-health-50 dark:from-gray-900 dark:to-gray-800 border-health-200/50">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
                <Pill className="h-5 w-5 text-health-600" />
              </div>
              <AlertTitle className="text-lg font-semibold">Medical Disclaimer</AlertTitle>
              <AlertDescription className="mt-2 text-sm leading-relaxed">
                This AI-powered analysis is for informational purposes only. 
                Always consult qualified healthcare professionals for medical decisions.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>

      <CardFooter className="bg-gradient-to-b from-transparent to-health-50/30 dark:to-gray-900/30 p-6">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Our AI system processes your health data using advanced medical knowledge bases and machine learning algorithms. 
          Results are generated in real-time but should not replace professional medical consultation.
        </p>
      </CardFooter>
    </Card>
  );
}; 
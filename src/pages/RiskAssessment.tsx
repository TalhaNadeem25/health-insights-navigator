import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertTriangle, Brain, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { geminiAnalyzeHealth, getGeminiApiKey, setGeminiApiKey } from "@/lib/gemini";
import { HealthReportAnalyzer } from "@/components/HealthReportAnalyzer";

const formSchema = z.object({
  age: z.string().min(1, {
    message: "Please enter your age.",
  }),
  gender: z.string({
    required_error: "Please select a gender.",
  }),
  bmi: z.string().min(1, {
    message: "Please enter your BMI.",
  }),
  bloodPressure: z.string().min(1, {
    message: "Please enter your blood pressure.",
  }),
  smokingStatus: z.string({
    required_error: "Please select your smoking status.",
  }),
  physicalActivity: z.string({
    required_error: "Please select your physical activity level.",
  }),
  familyHistory: z.string({
    required_error: "Please select if you have a family history of chronic diseases.",
  }),
  diet: z.string({
    required_error: "Please describe your diet.",
  }),
});

const diabetesRiskFactors = [
  { factor: "Age", value: "45 years", impact: "Medium" },
  { factor: "BMI", value: "32.1 (Obese)", impact: "High" },
  { factor: "Family History", value: "Yes", impact: "High" },
  { factor: "Physical Activity", value: "Low", impact: "High" },
  { factor: "Diet", value: "Poor nutritional quality", impact: "Medium" },
];

const heartRiskFactors = [
  { factor: "Blood Pressure", value: "140/95 mmHg", impact: "High" },
  { factor: "Smoking Status", value: "Former smoker", impact: "Medium" },
  { factor: "Physical Activity", value: "Low", impact: "Medium" },
  { factor: "Diet", value: "High in processed foods", impact: "High" },
  { factor: "Age", value: "45 years", impact: "Low" },
];

const RiskAssessment = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiKey, setApiKey] = useState(getGeminiApiKey() || "");
  const [showApiKeyInput, setShowApiKeyInput] = useState(!getGeminiApiKey());
  const { toast } = useToast();
  
  const [assessmentResults, setAssessmentResults] = useState<{
    diabetesRisk: number | null;
    heartRisk: number | null;
    llmAnalysis: string | null;
  }>({
    diabetesRisk: null,
    heartRisk: null,
    llmAnalysis: null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: "",
      gender: "",
      bmi: "",
      bloodPressure: "",
      smokingStatus: "",
      physicalActivity: "",
      familyHistory: "",
      diet: "",
    },
  });

  const saveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid Google Gemini API key",
        variant: "destructive",
      });
      return;
    }
    
    setGeminiApiKey(apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "API Key Saved",
      description: "Your Gemini API key has been saved",
      variant: "default",
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (!getGeminiApiKey()) {
        setShowApiKeyInput(true);
        setIsSubmitting(false);
        return;
      }
      
      // Use Gemini to analyze the health data
      const result = await geminiAnalyzeHealth(values);
      
      if (!result.success) {
        toast({
          title: "Analysis Failed",
          description: result.analysis,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      setAssessmentResults({
        diabetesRisk: result.diabetesRisk,
        heartRisk: result.heartRisk,
        llmAnalysis: result.analysis,
      });
    } catch (error) {
      console.error("Error during assessment:", error);
      toast({
        title: "Assessment Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High":
        return "text-red-500";
      case "Medium":
        return "text-amber-500";
      case "Low":
        return "text-green-500";
      default:
        return "";
    }
  };

  const getRiskLevel = (score: number) => {
    if (score >= 75) return { label: "High Risk", color: "text-red-500" };
    if (score >= 50) return { label: "Moderate Risk", color: "text-amber-500" };
    return { label: "Low Risk", color: "text-green-500" };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Individual Health Risk Assessment</h1>
        <p className="text-muted-foreground">
          Complete this form to get a Google Gemini LLM-powered assessment of your health risks
          and personalized recommendations.
        </p>
      </div>

      {showApiKeyInput && (
        <Card className="mb-8 border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Google Gemini API Key Required
            </CardTitle>
            <CardDescription>
              To use the LLM-powered health assessment, please enter your Google Gemini API key.
              This will be stored locally in your browser.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Enter your Google Gemini API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1"
              />
              <Button onClick={saveApiKey} disabled={!apiKey.trim()}>
                Save Key
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Don't have a key? Get one at{" "}
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                ai.google.dev
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        <HealthReportAnalyzer />
        
        {assessmentResults.diabetesRisk === null ? (
          <Card className="border-t-4 border-t-health-600">
            <CardHeader>
              <CardTitle>Health Assessment Form</CardTitle>
              <CardDescription>
                Enter your health information below for a Google Gemini AI-powered risk analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="Enter your age" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bmi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BMI</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="Enter your BMI" {...field} />
                          </FormControl>
                          <FormDescription>
                            Body Mass Index (weight kg / height m²)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bloodPressure"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Blood Pressure</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 120/80" {...field} />
                          </FormControl>
                          <FormDescription>
                            Systolic/Diastolic (mmHg)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="smokingStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Smoking Status</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="never" />
                                </FormControl>
                                <FormLabel className="font-normal">Never smoked</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="former" />
                                </FormControl>
                                <FormLabel className="font-normal">Former smoker</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="current" />
                                </FormControl>
                                <FormLabel className="font-normal">Current smoker</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="physicalActivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Physical Activity Level</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="sedentary" />
                                </FormControl>
                                <FormLabel className="font-normal">Sedentary (little to no exercise)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="light" />
                                </FormControl>
                                <FormLabel className="font-normal">Light (1-3 days/week)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="moderate" />
                                </FormControl>
                                <FormLabel className="font-normal">Moderate (3-5 days/week)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="active" />
                                </FormControl>
                                <FormLabel className="font-normal">Active (6-7 days/week)</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="veryActive" />
                                </FormControl>
                                <FormLabel className="font-normal">Very active (twice/day)</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="familyHistory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family History of Chronic Diseases</FormLabel>
                          <FormDescription>
                            (Diabetes, heart disease, stroke, etc.)
                          </FormDescription>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="yes" />
                                </FormControl>
                                <FormLabel className="font-normal">Yes</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="no" />
                                </FormControl>
                                <FormLabel className="font-normal">No</FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="unknown" />
                                </FormControl>
                                <FormLabel className="font-normal">Unknown</FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="diet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dietary Habits</FormLabel>
                          <FormDescription>
                            Briefly describe your typical diet (e.g., high in vegetables, processed foods, etc.)
                          </FormDescription>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your typical diet here..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full bg-health-600 hover:bg-health-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing your data with Gemini LLM...
                        </>
                      ) : (
                        "Submit Assessment"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Risk Summary</TabsTrigger>
              <TabsTrigger value="diabetes">Diabetes Risk</TabsTrigger>
              <TabsTrigger value="heart">Heart Disease Risk</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-health-600" />
                    <CardTitle>Google Gemini Powered Health Risk Analysis</CardTitle>
                  </div>
                  <CardDescription>
                    Personalized assessment based on your health information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Diabetes Risk</h3>
                        <div className={`font-bold ${getRiskLevel(assessmentResults.diabetesRisk!).color}`}>
                          {assessmentResults.diabetesRisk}/100
                        </div>
                      </div>
                      <div className="w-full h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-health-600" 
                          style={{ width: `${assessmentResults.diabetesRisk}%` }}
                        />
                      </div>
                      <p className={`text-sm mt-1 ${getRiskLevel(assessmentResults.diabetesRisk!).color}`}>
                        {getRiskLevel(assessmentResults.diabetesRisk!).label}
                      </p>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Heart Disease Risk</h3>
                        <div className={`font-bold ${getRiskLevel(assessmentResults.heartRisk!).color}`}>
                          {assessmentResults.heartRisk}/100
                        </div>
                      </div>
                      <div className="w-full h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-health-600" 
                          style={{ width: `${assessmentResults.heartRisk}%` }}
                        />
                      </div>
                      <p className={`text-sm mt-1 ${getRiskLevel(assessmentResults.heartRisk!).color}`}>
                        {getRiskLevel(assessmentResults.heartRisk!).label}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2 flex items-center gap-2">
                      <Brain className="h-4 w-4 text-health-600" />
                      Gemini LLM Analysis
                    </h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">
                      {assessmentResults.llmAnalysis}
                    </p>
                  </div>

                  <Alert className="bg-muted/50 border-health-200">
                    <Check className="h-4 w-4 text-health-600" />
                    <AlertTitle>Powered by Google Gemini</AlertTitle>
                    <AlertDescription>
                      This analysis was generated by Google&apos;s Gemini large language model.
                      Always consult healthcare professionals before making medical decisions.
                    </AlertDescription>
                  </Alert>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Recommended Next Steps</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Consult with a healthcare provider about your risk assessment</li>
                      <li>Discuss potential screenings for diabetes and heart health</li>
                      <li>Consider lifestyle modifications to reduce your risk factors</li>
                      <li>Follow up with your primary care provider within 3 months</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowApiKeyInput(true)}
                  >
                    Change API Key
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setAssessmentResults({ diabetesRisk: null, heartRisk: null, llmAnalysis: null })}
                  >
                    Start New Assessment
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="diabetes">
              <Card>
                <CardHeader>
                  <CardTitle>Diabetes Risk Factors</CardTitle>
                  <CardDescription>
                    Detailed breakdown of factors contributing to your diabetes risk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg overflow-hidden border">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left py-3 px-4">Risk Factor</th>
                            <th className="text-left py-3 px-4">Your Value</th>
                            <th className="text-left py-3 px-4">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {diabetesRiskFactors.map((factor, index) => (
                            <tr key={index} className="border-t">
                              <td className="py-3 px-4">{factor.factor}</td>
                              <td className="py-3 px-4">{factor.value}</td>
                              <td className={`py-3 px-4 font-medium ${getImpactColor(factor.impact)}`}>
                                {factor.impact}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Diabetes Prevention Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Focus on weight management through a balanced diet and regular exercise</li>
                        <li>Limit intake of refined carbohydrates and added sugars</li>
                        <li>Increase physical activity to at least 150 minutes per week</li>
                        <li>Get regular blood glucose screenings</li>
                        <li>Consider working with a registered dietitian to develop a personalized meal plan</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="heart">
              <Card>
                <CardHeader>
                  <CardTitle>Heart Disease Risk Factors</CardTitle>
                  <CardDescription>
                    Detailed breakdown of factors contributing to your heart disease risk
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg overflow-hidden border">
                      <table className="w-full">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left py-3 px-4">Risk Factor</th>
                            <th className="text-left py-3 px-4">Your Value</th>
                            <th className="text-left py-3 px-4">Impact</th>
                          </tr>
                        </thead>
                        <tbody>
                          {heartRiskFactors.map((factor, index) => (
                            <tr key={index} className="border-t">
                              <td className="py-3 px-4">{factor.factor}</td>
                              <td className="py-3 px-4">{factor.value}</td>
                              <td className={`py-3 px-4 font-medium ${getImpactColor(factor.impact)}`}>
                                {factor.impact}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Heart Health Recommendations</h3>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        <li>Work with your healthcare provider to manage your blood pressure</li>
                        <li>Follow a heart-healthy diet like the DASH or Mediterranean diet</li>
                        <li>Limit sodium intake to help control blood pressure</li>
                        <li>Incorporate regular aerobic exercise and strength training</li>
                        <li>Consider stress reduction techniques such as meditation or yoga</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;

import { useState, useEffect } from "react";
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { healthData as healthDataApi, predictions as predictionsApi } from "../lib/api";

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
    keyFactors: string[];
    confidence: number;
  }>({
    diabetesRisk: null,
    heartRisk: null,
    llmAnalysis: null,
    keyFactors: [],
    confidence: 0,
  });

  const [submittedHealthDataId, setSubmittedHealthDataId] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);

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

  // Query to get latest health data
  const { data: latestHealthData, isLoading: isLoadingHealthData } = useQuery({
    queryKey: ['latestHealthData'],
    queryFn: async () => {
      try {
        const response = await healthDataApi.getLatest();
        return response.healthData;
      } catch (error) {
        // If no health data exists yet, return null
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    }
  });

  // Query to get latest prediction
  const { data: latestPrediction, isLoading: isLoadingPrediction } = useQuery({
    queryKey: ['latestPrediction'],
    queryFn: async () => {
      try {
        const response = await predictionsApi.getLatest();
        return response.prediction;
      } catch (error) {
        // If no prediction exists yet, return null
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    }
  });

  // Mutation to submit health data
  const submitHealthDataMutation = useMutation({
    mutationFn: (data: any) => healthDataApi.submit(data),
    onSuccess: (response) => {
      setSubmittedHealthDataId(response.healthData._id);
      toast({
        title: "Health data submitted successfully",
        description: "Your health data has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error submitting health data",
        description: error.message || "Failed to submit health data",
        variant: "destructive",
      });
    }
  });

  // Mutation to generate prediction
  const generatePredictionMutation = useMutation({
    mutationFn: (healthDataId: string) => predictionsApi.generate(healthDataId),
    onSuccess: (response) => {
      // If prediction already exists
      if (response.isExisting) {
        setAssessmentResults({
          diabetesRisk: response.prediction.diabetesRisk.score,
          heartRisk: response.prediction.heartDiseaseRisk.score,
          llmAnalysis: response.prediction.analysis,
          keyFactors: response.prediction.keyFactors.map(kf => kf.factor),
          confidence: response.prediction.modelInfo.confidence,
        });
        toast({
          title: "Existing prediction retrieved",
          description: "A previous prediction for this health data was found.",
        });
      } else {
        setAssessmentResults({
          diabetesRisk: response.prediction.diabetesRisk.score,
          heartRisk: response.prediction.heartDiseaseRisk.score,
          llmAnalysis: response.prediction.analysis,
          keyFactors: response.prediction.keyFactors.map(kf => kf.factor),
          confidence: response.prediction.modelInfo.confidence,
        });
        toast({
          title: "Prediction generated successfully",
          description: "Your health risk assessment is ready.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error generating prediction",
        description: error.message || "Failed to generate prediction",
        variant: "destructive",
      });
    }
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
      // Parse blood pressure string to systolic/diastolic
      let bloodPressureObj = { systolic: 120, diastolic: 80 }; // Default values
      if (values.bloodPressure && values.bloodPressure.includes('/')) {
        const [systolic, diastolic] = values.bloodPressure.split('/').map(v => parseInt(v.trim()));
        bloodPressureObj = { systolic, diastolic };
      }
      
      // Submit health data to backend
      const healthDataResponse = await submitHealthDataMutation.mutateAsync({
        ...values,
        bloodPressure: bloodPressureObj
      });
      
      // Generate prediction from health data
      setIsPredicting(true);
      await generatePredictionMutation.mutateAsync(healthDataResponse.healthData._id);
    } catch (error) {
      console.error("Error during assessment:", error);
      toast({
        title: "Assessment Failed",
        description: `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsPredicting(false);
    }
  };

  // Use existing prediction if available
  useEffect(() => {
    if (latestPrediction && !assessmentResults.diabetesRisk) {
      setAssessmentResults({
        diabetesRisk: latestPrediction.diabetesRisk.score,
        heartRisk: latestPrediction.heartDiseaseRisk.score,
        llmAnalysis: latestPrediction.analysis,
        keyFactors: latestPrediction.keyFactors.map(kf => kf.factor),
        confidence: latestPrediction.modelInfo.confidence,
      });
    }
  }, [latestPrediction]);

  // Pre-fill form with latest health data if available
  useEffect(() => {
    if (latestHealthData) {
      form.reset({
        age: latestHealthData.age.toString(),
        gender: latestHealthData.gender,
        bmi: latestHealthData.bmi.toString(),
        bloodPressure: `${latestHealthData.bloodPressure.systolic}/${latestHealthData.bloodPressure.diastolic}`,
        smokingStatus: latestHealthData.smokingStatus,
        physicalActivity: latestHealthData.physicalActivity,
        familyHistory: Object.values(latestHealthData.familyHistory).some(v => v) ? "yes" : "no",
        diet: latestHealthData.diet
      });
    }
  }, [latestHealthData]);

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Health Risk Assessment Results
              </CardTitle>
              <CardDescription>
                AI-powered analysis based on your health data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Diabetes Risk</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: "100%" }}
                    />
                    <span className="text-sm font-medium">
                      {assessmentResults.diabetesRisk}/100
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {getRiskLevel(assessmentResults.diabetesRisk!).label}
                  </p>
                </div>

                <div className="flex-1 border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Heart Disease Risk</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      style={{ width: "100%" }}
                    />
                    <span className="text-sm font-medium">
                      {assessmentResults.heartRisk}/100
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {getRiskLevel(assessmentResults.heartRisk!).label}
                  </p>
                </div>
                
                <div className="flex-1 border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">AI Confidence</h3>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                      style={{ width: "100%" }}
                    />
                    <span className="text-sm font-medium">
                      {Math.round(assessmentResults.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-muted-foreground">
                    {assessmentResults.confidence >= 0.7 
                      ? "High Confidence" 
                      : assessmentResults.confidence >= 0.4 
                      ? "Moderate Confidence" 
                      : "Low Confidence"}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Key Risk Factors</h3>
                  {assessmentResults.keyFactors.length > 0 ? (
                    <ul className="space-y-2">
                      {assessmentResults.keyFactors.map((factor, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm">{factor}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No specific risk factors identified.</p>
                  )}
                </div>
              </div>

              <div className="border rounded-lg">
                <div className="p-4">
                  <h3 className="font-semibold mb-2">LLM Analysis</h3>
                  <div className="text-sm whitespace-pre-wrap">
                    {assessmentResults.llmAnalysis}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="diabetes">
                <TabsList className="w-full">
                  <TabsTrigger value="diabetes">Diabetes Risk Factors</TabsTrigger>
                  <TabsTrigger value="heart">Heart Disease Risk Factors</TabsTrigger>
                </TabsList>
                <TabsContent value="diabetes">
                  <div className="border rounded-lg divide-y">
                    {diabetesRiskFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{factor.factor}</h4>
                          <p className="text-sm text-muted-foreground">
                            {factor.value}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${getImpactColor(
                            factor.impact
                          )}`}
                        >
                          {factor.impact} Impact
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="heart">
                  <div className="border rounded-lg divide-y">
                    {heartRiskFactors.map((factor, index) => (
                      <div
                        key={index}
                        className="p-3 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-medium">{factor.factor}</h4>
                          <p className="text-sm text-muted-foreground">
                            {factor.value}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${getImpactColor(
                            factor.impact
                          )}`}
                        >
                          {factor.impact} Impact
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default RiskAssessment;

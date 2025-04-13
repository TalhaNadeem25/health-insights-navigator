import { useState } from "react";
import { AlertTriangle, BarChart3, Check, Cloud, CogIcon, FileDown, Server, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { deployModel, getModelMetrics } from "@/lib/api";
import { getGeminiApiKey } from "@/lib/gemini";

const ModelDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedModels, setDeployedModels] = useState<any[]>([]);
  const [selectedModelType, setSelectedModelType] = useState<'individual' | 'community'>('individual');
  const [deploymentConfig, setDeploymentConfig] = useState({
    temperature: 0.2,
    topP: 0.8,
    maxTokens: 2048,
    useCache: true,
    monitoring: true,
    feedbackCollection: true,
    dataDriftDetection: true,
    autoRetrain: false,
    retrainThreshold: 0.05,
    maxLatency: 500, // ms
  });
  
  const [modelMetrics, setModelMetrics] = useState<any>(null);
  const [apiKeySet, setApiKeySet] = useState(!!getGeminiApiKey());
  
  const handleDeploy = async () => {
    if (!apiKeySet) {
      alert("Please set your API key in the Risk Assessment page first.");
      return;
    }
    
    setIsDeploying(true);
    try {
      const result = await deployModel(selectedModelType);
      if (result.success) {
        setDeployedModels([...deployedModels, {
          id: result.modelId,
          type: selectedModelType,
          status: 'active',
          deployedAt: new Date().toISOString(),
          config: { ...deploymentConfig },
          endpoint: result.endpoint
        }]);
        
        // Fetch initial metrics
        const metrics = await getModelMetrics(result.modelId);
        if (metrics.success) {
          setModelMetrics(metrics.metrics);
        }
      }
    } catch (error) {
      console.error("Deployment error:", error);
    } finally {
      setIsDeploying(false);
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'training':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Model Deployment & Monitoring</h1>
        <p className="text-muted-foreground">
          Deploy your health analytics models to production and monitor their performance
        </p>
      </div>
      
      {!apiKeySet && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>API Key Required</AlertTitle>
          <AlertDescription>
            Please set your Gemini API key in the Risk Assessment page before deploying models.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-primary" />
                Deploy Health Analytics Model
              </CardTitle>
              <CardDescription>
                Configure and deploy your model for production use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Select Model Type</h3>
                <RadioGroup 
                  defaultValue="individual" 
                  value={selectedModelType}
                  onValueChange={(value) => setSelectedModelType(value as 'individual' | 'community')}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div className={`border rounded-lg p-4 cursor-pointer ${selectedModelType === 'individual' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="individual" id="individual" className="sr-only" />
                    <Label htmlFor="individual" className="flex flex-col cursor-pointer space-y-2">
                      <span className="text-lg font-medium">Individual Health Analysis</span>
                      <span className="text-sm text-muted-foreground">
                        Process individual health data for personalized risk assessment and recommendations
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">High Precision</Badge>
                        <Badge variant="outline">Medical Guidelines</Badge>
                        <Badge variant="outline">Personalized</Badge>
                      </div>
                    </Label>
                  </div>
                  <div className={`border rounded-lg p-4 cursor-pointer ${selectedModelType === 'community' ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value="community" id="community" className="sr-only" />
                    <Label htmlFor="community" className="flex flex-col cursor-pointer space-y-2">
                      <span className="text-lg font-medium">Community Health Analysis</span>
                      <span className="text-sm text-muted-foreground">
                        Analyze population health data to identify trends, risks, and resource needs
                      </span>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">Population Focus</Badge>
                        <Badge variant="outline">Resource Planning</Badge>
                        <Badge variant="outline">Epidemiology</Badge>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Model Configuration</h3>
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Config
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperature</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[deploymentConfig.temperature]} 
                        min={0} 
                        max={1} 
                        step={0.1}
                        onValueChange={(value) => setDeploymentConfig({...deploymentConfig, temperature: value[0]})}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{deploymentConfig.temperature}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Lower values produce more consistent, deterministic outputs
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Top P</Label>
                    <div className="flex items-center gap-4">
                      <Slider 
                        value={[deploymentConfig.topP]} 
                        min={0} 
                        max={1} 
                        step={0.1}
                        onValueChange={(value) => setDeploymentConfig({...deploymentConfig, topP: value[0]})}
                        className="flex-1"
                      />
                      <span className="w-12 text-right">{deploymentConfig.topP}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Controls diversity by limiting to top percentile of token distribution
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Output Tokens</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number" 
                        value={deploymentConfig.maxTokens}
                        min={512}
                        max={8192}
                        onChange={(e) => setDeploymentConfig({...deploymentConfig, maxTokens: parseInt(e.target.value)})}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum length of generated response
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Max Allowed Latency (ms)</Label>
                    <div className="flex items-center gap-4">
                      <Input 
                        type="number" 
                        value={deploymentConfig.maxLatency}
                        min={100}
                        max={2000}
                        onChange={(e) => setDeploymentConfig({...deploymentConfig, maxLatency: parseInt(e.target.value)})}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum allowed response time before timing out
                    </p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Production Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="useCache">Response Caching</Label>
                      <p className="text-xs text-muted-foreground">
                        Cache identical requests to improve response time
                      </p>
                    </div>
                    <Switch 
                      id="useCache" 
                      checked={deploymentConfig.useCache}
                      onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, useCache: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="monitoring">Performance Monitoring</Label>
                      <p className="text-xs text-muted-foreground">
                        Track model performance metrics in production
                      </p>
                    </div>
                    <Switch 
                      id="monitoring" 
                      checked={deploymentConfig.monitoring}
                      onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, monitoring: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="feedbackCollection">User Feedback Collection</Label>
                      <p className="text-xs text-muted-foreground">
                        Collect user feedback for model improvement
                      </p>
                    </div>
                    <Switch 
                      id="feedbackCollection" 
                      checked={deploymentConfig.feedbackCollection}
                      onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, feedbackCollection: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dataDriftDetection">Data Drift Detection</Label>
                      <p className="text-xs text-muted-foreground">
                        Monitor and alert for changes in input data patterns
                      </p>
                    </div>
                    <Switch 
                      id="dataDriftDetection" 
                      checked={deploymentConfig.dataDriftDetection}
                      onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, dataDriftDetection: checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoRetrain">Automatic Retraining</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically retrain when performance drops
                      </p>
                    </div>
                    <Switch 
                      id="autoRetrain" 
                      checked={deploymentConfig.autoRetrain}
                      onCheckedChange={(checked) => setDeploymentConfig({...deploymentConfig, autoRetrain: checked})}
                    />
                  </div>
                  
                  {deploymentConfig.autoRetrain && (
                    <div className="space-y-2">
                      <Label>Retraining Threshold</Label>
                      <div className="flex items-center gap-4">
                        <Slider 
                          value={[deploymentConfig.retrainThreshold]} 
                          min={0.01} 
                          max={0.2} 
                          step={0.01}
                          onValueChange={(value) => setDeploymentConfig({...deploymentConfig, retrainThreshold: value[0]})}
                          className="flex-1"
                        />
                        <span className="w-12 text-right">{deploymentConfig.retrainThreshold}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Performance drop threshold to trigger retraining
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleDeploy} 
                disabled={isDeploying || !apiKeySet} 
                className="w-full"
              >
                {isDeploying ? (
                  <>
                    <div className="h-4 w-4 mr-2 rounded-full border-2 border-t-transparent border-white animate-spin" />
                    Deploying Model...
                  </>
                ) : (
                  <>
                    <Server className="h-4 w-4 mr-2" />
                    Deploy to Production
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {modelMetrics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Model Performance Metrics
                </CardTitle>
                <CardDescription>
                  Real-time performance data for your deployed model
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Accuracy</h4>
                    <div className="text-2xl font-bold">{(modelMetrics.accuracy * 100).toFixed(1)}%</div>
                    <Progress value={modelMetrics.accuracy * 100} className="h-1 mt-2" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Precision</h4>
                    <div className="text-2xl font-bold">{(modelMetrics.precision * 100).toFixed(1)}%</div>
                    <Progress value={modelMetrics.precision * 100} className="h-1 mt-2" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Recall</h4>
                    <div className="text-2xl font-bold">{(modelMetrics.recall * 100).toFixed(1)}%</div>
                    <Progress value={modelMetrics.recall * 100} className="h-1 mt-2" />
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">F1 Score</h4>
                    <div className="text-2xl font-bold">{(modelMetrics.f1Score * 100).toFixed(1)}%</div>
                    <Progress value={modelMetrics.f1Score * 100} className="h-1 mt-2" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Average Latency</h4>
                    <div className="flex items-center">
                      <div className="text-xl font-bold">{modelMetrics.latency}</div>
                      <Badge variant="outline" className="ml-2">
                        {parseInt(modelMetrics.latency) < deploymentConfig.maxLatency ? 'Within SLA' : 'Exceeds SLA'}
                      </Badge>
                    </div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Daily Requests</h4>
                    <div className="text-xl font-bold">{modelMetrics.requestsPerDay.toLocaleString()}</div>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-2">Avg. Confidence</h4>
                    <div className="text-xl font-bold">{(modelMetrics.averageConfidence * 100).toFixed(1)}%</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium mb-4">Data Distribution</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-sm font-medium mb-2">Age Groups</h5>
                      <div className="space-y-2">
                        {Object.entries(modelMetrics.dataDistribution.ageGroups).map(([group, value]: [string, any]) => (
                          <div key={group} className="flex items-center justify-between text-sm">
                            <div>{group}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-40 bg-muted rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-primary h-full" 
                                  style={{ width: `${(value as number) * 100}%` }}
                                />
                              </div>
                              <div>{((value as number) * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium mb-2">Gender Distribution</h5>
                      <div className="space-y-2">
                        {Object.entries(modelMetrics.dataDistribution.genderDistribution).map(([gender, value]: [string, any]) => (
                          <div key={gender} className="flex items-center justify-between text-sm">
                            <div>{gender.charAt(0).toUpperCase() + gender.slice(1)}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-40 bg-muted rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-primary h-full" 
                                  style={{ width: `${(value as number) * 100}%` }}
                                />
                              </div>
                              <div>{((value as number) * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Deployed Models
              </CardTitle>
              <CardDescription>
                Manage your active model deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deployedModels.length > 0 ? (
                <div className="space-y-2">
                  {deployedModels.map((model) => (
                    <div key={model.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium truncate">{model.id}</div>
                        <div className="flex items-center">
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(model.status)} mr-1`} />
                          <span className="text-xs">
                            {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {model.type === 'individual' ? 'Individual Health Analysis' : 'Community Health Analysis'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Deployed: {new Date(model.deployedAt).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                          <CogIcon className="h-3 w-3 mr-1" />
                          Settings
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Metrics
                        </Button>
                        <Button variant="destructive" size="sm" className="text-xs h-7 px-2 ml-auto">
                          Stop
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>No models deployed yet</p>
                  <p className="text-sm">Configure and deploy a model to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                Model Validation
              </CardTitle>
              <CardDescription>
                Pre-deployment validation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Input Validation</div>
                    <div className="text-xs text-muted-foreground">All input schemas validated</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Response Format</div>
                    <div className="text-xs text-muted-foreground">Outputs match expected schema</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Medical Accuracy</div>
                    <div className="text-xs text-muted-foreground">92.5% match with clinical guidelines</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Response Time</div>
                    <div className="text-xs text-muted-foreground">Avg. 245ms (below 500ms threshold)</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <div className="font-medium">Edge Case Handling</div>
                    <div className="text-xs text-muted-foreground">3 minor issues identified</div>
                  </div>
                </div>
                
                <div className="mt-4 border-t pt-4">
                  <div className="text-sm font-medium mb-2">Overall Validation Score</div>
                  <div className="flex items-center gap-2">
                    <Progress value={94} className="h-2 flex-1" />
                    <span className="font-medium">94%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Model meets production quality standards
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModelDeployment; 
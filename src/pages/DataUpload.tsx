
import { useState } from "react";
import { FileText, Upload, FileUp, FilePlus, Check, Loader2, AlertTriangle, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const DataUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [textInput, setTextInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [analyzedFiles, setAnalyzedFiles] = useState<Array<{
    name: string;
    size: string;
    type: string;
    status: "analyzing" | "analyzed" | "error";
    insights: string;
  }>>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const uploadFiles = () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus("uploading");
    
    // Simulate file upload with progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        setUploadStatus("success");
        setIsAnalyzing(true);
        
        // Simulate LLM analysis of files
        setTimeout(() => {
          const analyzed = files.map((file) => ({
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type.split("/")[1].toUpperCase(),
            status: "analyzed" as const,
            insights: "LLM analysis indicates several mentions of respiratory health concerns in the Northeast district, particularly among children. There's a correlation with air quality issues reported in the same area. Consider prioritizing asthma screening resources in this community.",
          }));
          setAnalyzedFiles(analyzed);
          setIsAnalyzing(false);
        }, 3000);
      }
    }, 100);
  };

  const analyzeText = () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    
    // Simulate LLM analysis of text input
    setTimeout(() => {
      const newAnalyzedFile = {
        name: "Text Input Analysis",
        size: `${textInput.length} chars`,
        type: "TEXT",
        status: "analyzed" as const,
        insights: "Text analysis reveals recurring concerns about medication access in the Southgate community, particularly for chronic conditions like diabetes. Many individuals report having to travel over 30 minutes to the nearest pharmacy. This aligns with previous transportation barrier reports in the same area. Recommend mobile pharmacy services or medication delivery programs for this community.",
      };
      setAnalyzedFiles([...analyzedFiles, newAnalyzedFile]);
      setIsAnalyzing(false);
      setTextInput("");
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Data Upload & Analysis</h1>
        <p className="text-muted-foreground">
          Upload or input unstructured health data for LLM-powered analysis
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">
            <FileUp className="h-4 w-4 mr-2" />
            File Upload
          </TabsTrigger>
          <TabsTrigger value="text">
            <FileText className="h-4 w-4 mr-2" />
            Text Input
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upload">
          <Card className="border-t-4 border-t-health-600">
            <CardHeader>
              <CardTitle>Upload Health Data Files</CardTitle>
              <CardDescription>
                Upload documents, reports, or other text data for LLM analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <Upload className="h-10 w-10 text-muted-foreground" />
                  <h3 className="font-semibold">Drag files here or click to browse</h3>
                  <p className="text-sm text-muted-foreground">
                    Support for TXT, PDF, DOCX, CSV files (max 10MB each)
                  </p>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    accept=".txt,.pdf,.docx,.csv"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Selected Files ({files.length})</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <div>
                          {uploadStatus === "uploading" ? (
                            <div className="h-5 w-5 rounded-full border-2 border-t-health-600 animate-spin" />
                          ) : uploadStatus === "success" ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>

                  {uploadStatus === "uploading" && (
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-health-600 transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground">
                        Uploading... {uploadProgress}%
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={uploadFiles} 
                      disabled={isUploading || uploadStatus === "success"}
                      className="bg-health-600 hover:bg-health-700"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : uploadStatus === "success" ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Uploaded
                        </>
                      ) : (
                        <>
                          <FileUp className="mr-2 h-4 w-4" />
                          Upload Files
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="text">
          <Card className="border-t-4 border-t-health-600">
            <CardHeader>
              <CardTitle>Input Text Data</CardTitle>
              <CardDescription>
                Paste text from reports, feedback, or other sources for LLM analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Textarea
                  placeholder="Paste or type text data here for analysis..."
                  className="min-h-[200px] resize-none"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Input any relevant health-related text data such as community feedback, health reports, 
                  survey results, or social media content.
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={analyzeText} 
                  disabled={!textInput.trim() || isAnalyzing}
                  className="bg-health-600 hover:bg-health-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Analyze Text
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {(isAnalyzing || analyzedFiles.length > 0) && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FilePlus className="h-5 w-5 text-health-600" />
                <CardTitle>LLM Analysis Results</CardTitle>
              </div>
              <CardDescription>
                AI-generated insights from your uploaded data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                  <Loader2 className="h-8 w-8 text-health-600 animate-spin" />
                  <p className="text-muted-foreground">
                    Our LLM is analyzing your data for health insights...
                  </p>
                </div>
              ) : analyzedFiles.length > 0 ? (
                <div className="space-y-6">
                  {analyzedFiles.map((file, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-4 bg-muted">
                        <div className="flex items-center">
                          {file.type === "TEXT" ? (
                            <FileText className="h-5 w-5 mr-2 text-blue-500" />
                          ) : file.type === "PDF" ? (
                            <FileText className="h-5 w-5 mr-2 text-red-500" />
                          ) : file.type === "DOCX" ? (
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                          ) : file.type === "CSV" ? (
                            <FileText className="h-5 w-5 mr-2 text-green-500" />
                          ) : (
                            <FileQuestion className="h-5 w-5 mr-2 text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {file.type} • {file.size}
                            </p>
                          </div>
                        </div>
                        <div>
                          {file.status === "analyzing" ? (
                            <div className="flex items-center text-amber-500">
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              <span className="text-xs">Analyzing</span>
                            </div>
                          ) : file.status === "analyzed" ? (
                            <div className="flex items-center text-green-500">
                              <Check className="h-4 w-4 mr-1" />
                              <span className="text-xs">Analyzed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-red-500">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              <span className="text-xs">Error</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium mb-2">LLM-Generated Insights</h3>
                        <div className="text-sm text-muted-foreground">
                          {file.insights}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="mt-8">
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <CardTitle className="text-amber-800 dark:text-amber-400 text-sm font-medium">Data Privacy Notice</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-800/80 dark:text-amber-400/80">
              All data uploaded to this platform is processed securely and used only for generating health insights.
              Please ensure all data is appropriately anonymized before uploading.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataUpload;

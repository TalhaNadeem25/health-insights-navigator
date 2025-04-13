import { useState } from "react";
import { FileText, Upload, FileUp, FilePlus, Check, Loader2, AlertTriangle, FileQuestion, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { geminiAnalyzeHealth } from "@/lib/gemini";

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
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    name: string;
    size: string;
    type: string;
    content: string;
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

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);
    
    try {
      // Start progress animation
      const startTime = Date.now();
      const duration = 5000; // 5 seconds

      // Process files first but don't update UI yet
      const uploadedFilesPromise = Promise.all(
        files.map(async (file) => ({
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type.split("/")[1].toUpperCase(),
          content: await file.text()
        }))
      );

      // Run the progress animation
      return new Promise((resolve) => {
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min((elapsed / duration) * 100, 99);
          setUploadProgress(progress);
          
          if (elapsed >= duration) {
            clearInterval(progressInterval);
            
            // Once animation is complete, resolve with the uploaded files
            uploadedFilesPromise.then(uploaded => {
              setUploadProgress(100);
              setUploadedFiles(uploaded);
              setUploadStatus("success");
              setIsUploading(false);
              resolve(uploaded);
            });
          }
        }, 50); // Update every 50ms for smooth animation
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("error");
      setIsUploading(false);
    }
  };

  const analyzeFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsAnalyzing(true);
    setAnalyzedFiles([]);
    
    try {
      const analyzed = await Promise.all(
        uploadedFiles.map(async (file) => {
          const result = await geminiAnalyzeHealth({
            freeFormReport: file.content,
          });

          return {
            name: file.name,
            size: file.size,
            type: file.type,
            status: result.success ? "analyzed" as const : "error" as const,
            insights: result.analysis,
          };
        })
      );
      
      setAnalyzedFiles(analyzed);
    } catch (error) {
      console.error("Error analyzing files:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeText = async () => {
    if (!textInput.trim()) return;

    setIsAnalyzing(true);
    setAnalyzedFiles([]);
    
    try {
      const result = await geminiAnalyzeHealth({
        freeFormReport: textInput,
      });

      const newAnalyzedFile = {
        name: "Text Input Analysis",
        size: `${textInput.length} chars`,
        type: "TEXT",
        status: result.success ? "analyzed" as const : "error" as const,
        insights: result.analysis,
      };
      
      setAnalyzedFiles([newAnalyzedFile]);
    } catch (error) {
      console.error("Error analyzing text:", error);
      const errorFile = {
        name: "Text Input Analysis",
        size: `${textInput.length} chars`,
        type: "TEXT",
        status: "error" as const,
        insights: `Error analyzing text: ${error instanceof Error ? error.message : String(error)}`,
      };
      setAnalyzedFiles([errorFile]);
    } finally {
      setIsAnalyzing(false);
      setTextInput("");
    }
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
                            <div className="flex items-center gap-2">
                              <div className="h-5 w-5">
                                <svg className="animate-spin h-5 w-5 text-health-600" viewBox="0 0 24 24">
                                  <circle 
                                    className="opacity-25" 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor" 
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                              </div>
                              <span className="text-xs text-health-600 animate-pulse">
                                Processing...
                              </span>
                            </div>
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
                          className="h-full bg-health-600 transition-all duration-300 ease-out relative"
                          style={{ width: `${uploadProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-[pulse_1.5s_ease-in-out_infinite]" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Uploading files...</span>
                        <span className="font-medium">{Math.round(uploadProgress)}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={uploadFiles} 
                      disabled={isUploading || uploadStatus === "success"}
                      className={`relative ${uploadStatus === "uploading" ? 'bg-health-600/80' : 'bg-health-600'} hover:bg-health-700`}
                    >
                      {isUploading ? (
                        <>
                          <div className="absolute inset-0 bg-white/10 animate-pulse rounded-md" />
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
                    {uploadStatus === "success" && (
                      <Button 
                        onClick={analyzeFiles} 
                        disabled={isAnalyzing}
                        className="bg-health-600 hover:bg-health-700"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Brain className="mr-2 h-4 w-4" />
                            Analyze Files
                          </>
                        )}
                      </Button>
                    )}
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
                        <h3 className="font-medium mb-4 text-lg flex items-center gap-2">
                          <Brain className="h-5 w-5 text-health-600" />
                          LLM-Generated Insights
                        </h3>
                        <div className="space-y-6 text-sm">
                          {file.status === "analyzed" && (
                            <>
                              {file.insights.split('**').map((section, idx) => {
                                // Skip empty sections
                                if (!section.trim()) return null;
                                
                                // Check if this is a header section
                                if (section.includes(':')) {
                                  const [header, content] = section.split(':');
                                  return (
                                    <div key={idx} className="space-y-2">
                                      <h4 className="font-semibold text-base text-health-600">
                                        {header.trim()}
                                      </h4>
                                      <div className="pl-4">
                                        {content.split('*').map((item, itemIdx) => {
                                          const trimmedItem = item.trim();
                                          if (!trimmedItem) return null;
                                          return (
                                            <div key={itemIdx} className="flex items-start gap-2 mb-2">
                                              <div className="w-1.5 h-1.5 rounded-full bg-health-600 mt-2" />
                                              <p className="text-muted-foreground flex-1">
                                                {trimmedItem}
                                              </p>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                                
                                // Regular content
                                return (
                                  <p key={idx} className="text-muted-foreground">
                                    {section.trim()}
                                  </p>
                                );
                              })}
                            </>
                          )}
                          {file.status === "error" && (
                            <div className="text-red-500">
                              {file.insights}
                            </div>
                          )}
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

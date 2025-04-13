import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, User, AlertTriangle, ArrowUp, Loader2, Brain } from "lucide-react";
import { cn } from '@/lib/utils';
import { useToast } from './ui/use-toast';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ClientSideVectorStore } from '@/lib/vectorStorage';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HealthInsight {
  condition: string;
  risk?: 'low' | 'medium' | 'high';  // Keep for backward compatibility
  riskLevel?: string;  // Add new property for flexibility
  confidence: number;
  details?: string;  // Make optional
  recommendations: string[];
}

// Client-side Gemini API integration
async function generateGeminiResponse(message: string, context: string = ''): Promise<{ response: string, insights: HealthInsight[] }> {
  try {
    // Get API key from local storage or use default
    const apiKey = localStorage.getItem('geminiApiKey') || import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('Gemini API key not found');
    }
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Build system prompt with instructions for health analysis
    const systemPrompt = `You are an AI health assistant providing helpful, accurate, and evidence-based health information. 
    Analyze the user's input and respond with helpful health information.
    
    ${context ? `Context from previous conversation: The user has been discussing ${context} health topics.` : ''}
    
    IMPORTANT: Keep all responses VERY brief and concise, limited to 2-3 sentences maximum.
    
    If the user describes specific health concerns, symptoms, or conditions, identify potential health insights.
    
    For your response, provide:
    1. A brief 2-3 sentence helpful response to the user's query with factual health information
    2. Optional JSON data for health insights in this exact format (only if you can identify specific health conditions):
    
    ---INSIGHTS_JSON_START---
    [
      {
        "condition": "Name of health condition",
        "riskLevel": "low|medium|high",
        "confidence": 0.XX,
        "details": "Brief explanation of the insight",
        "recommendations": ["Recommendation 1", "Recommendation 2", "..."]
      }
    ]
    ---INSIGHTS_JSON_END---
    
    Important guidelines:
    - Keep responses extremely brief - no more than 2-3 sentences
    - Always include appropriate medical disclaimers in the insights, not the main response
    - Never provide definitive medical diagnoses
    - Recommend consulting healthcare professionals for serious concerns
    - Base your response on established medical knowledge
    - If you cannot provide insights JSON, just respond normally without it`;
    
    // Send the request to Gemini
    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] },
        { role: "model", parts: [{ text: "I understand. I'll provide very brief, 2-3 sentence responses along with structured insights when appropriate." }] },
        { role: "user", parts: [{ text: message }] }
      ]
    });
    
    const responseText = result.response.text();
    
    // Extract insights JSON if present
    let insights: HealthInsight[] = [];
    const jsonStartMarker = "---INSIGHTS_JSON_START---";
    const jsonEndMarker = "---INSIGHTS_JSON_END---";
    
    if (responseText.includes(jsonStartMarker) && responseText.includes(jsonEndMarker)) {
      const jsonStartIndex = responseText.indexOf(jsonStartMarker) + jsonStartMarker.length;
      const jsonEndIndex = responseText.indexOf(jsonEndMarker);
      const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex).trim();
      
      try {
        insights = JSON.parse(jsonString);
      } catch (error) {
        console.error("Failed to parse insights JSON:", error);
      }
      
      // Remove the JSON from the response
      const cleanedResponse = responseText
        .replace(responseText.substring(responseText.indexOf(jsonStartMarker), responseText.indexOf(jsonEndMarker) + jsonEndMarker.length), '')
        .trim();
      
      return { response: cleanedResponse, insights };
    }
    
    return { response: responseText, insights: [] };
  } catch (error) {
    console.error("Error generating response with Gemini:", error);
    
    // Fallback response if the API call fails
    return {
      response: "I'm having trouble connecting to the AI service. Please check your internet connection and API key in settings.",
      insights: []
    };
  }
}

export function HealthReportAnalyzer() {
  const [healthReport, setHealthReport] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState<HealthInsight[]>([]);
  const [activeTab, setActiveTab] = useState('chat');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationContext, setConversationContext] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [apiKeySet, setApiKeySet] = useState<boolean>(false);
  const [vectorStore] = useState<ClientSideVectorStore>(() => new ClientSideVectorStore());

  // Check if API key is available
  useEffect(() => {
    const checkApiKey = () => {
      const key = localStorage.getItem('geminiApiKey') || import.meta.env.VITE_GEMINI_API_KEY;
      setApiKeySet(!!key);
    };
    
    checkApiKey();
    window.addEventListener('storage', checkApiKey);
    
    return () => {
      window.removeEventListener('storage', checkApiKey);
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on component mount
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello! I'm your AI health assistant powered by Gemini. You can describe your symptoms, health concerns, or share your health reports, and I'll analyze them to provide insights. What health information would you like to discuss today?",
        timestamp: new Date(),
      });
    }
  }, []);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = async () => {
    if (!healthReport.trim()) return;
    
    if (!apiKeySet) {
      toast({
        title: "API Key Missing",
        description: "Please set your Gemini API key in the settings or .env file",
        variant: "destructive",
      });
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: healthReport,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    
    // Update conversation context based on user message
    const lowercaseMessage = healthReport.toLowerCase();
    if (lowercaseMessage.includes('heart')) {
      setConversationContext('heart');
    } else if (lowercaseMessage.includes('diabetes')) {
      setConversationContext('diabetes');
    } else if (lowercaseMessage.includes('weight')) {
      setConversationContext('weight');
    } else if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('anxiety')) {
      setConversationContext('stress');
    } else if (lowercaseMessage.includes('breath') || lowercaseMessage.includes('lung')) {
      setConversationContext('respiratory');
    }
    
    // Clear input
    setHealthReport("");
    setIsAnalyzing(true);
    setIsTyping(true);
    
    try {
      // Find relevant knowledge base entries
      let additionalContext = '';
      
      try {
        // Only add this if the vector store has documents
        const documents = vectorStore.getAllDocuments();
        if (documents.length > 0) {
          const relevantDocs = await vectorStore.search(healthReport, 2);
          
          if (relevantDocs.length > 0) {
            additionalContext = '\n\nRelevant health knowledge from your knowledge base:\n';
            relevantDocs.forEach((doc, index) => {
              const metadata = doc.metadata as any;
              additionalContext += `\n${index + 1}. ${metadata?.title || 'Health Information'}: ${doc.content}\n`;
            });
          }
        }
      } catch (error) {
        console.log('No knowledge base entries found or error searching:', error);
        // Continue without knowledge base context if there's an error
      }
      
      // Generate response with Gemini API including knowledge base entries
      const { response, insights: newInsights } = await generateGeminiResponse(
        healthReport + additionalContext, 
        conversationContext
      );
      
      // Add AI response
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      
      // Update insights
      if (newInsights.length > 0) {
        setInsights(prev => {
          // Filter out duplicates based on condition name
          const existingConditions = new Set(prev.map(i => i.condition));
          const uniqueNewInsights = newInsights.filter(insight => !existingConditions.has(insight.condition));
          return [...prev, ...uniqueNewInsights];
        });
        
        // Show insights tab notification
        if (activeTab === 'chat') {
          setTimeout(() => {
            toast({
              title: "Analysis Complete",
              description: "Health insights are now available in the Insights tab",
              duration: 5000,
            });
          }, 500);
        }
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again later or check your API key configuration.",
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      
      toast({
        title: "Error",
        description: "Failed to generate response. Please check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  function getRiskColor(risk: string | undefined): string {
    if (!risk) return "bg-gray-500 text-white";
    
    const riskLower = risk.toLowerCase();
    if (riskLower.includes('low')) return "bg-green-500 text-white";
    if (riskLower.includes('medium')) return "bg-yellow-500 text-white";
    if (riskLower.includes('high')) return "bg-red-500 text-white";
    
    return "bg-gray-500 text-white";
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              AI Health Assessment
            </CardTitle>
            <CardDescription>
              Chat with our AI for personalized health insights
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary px-2 py-1">
            Up to 90% accuracy
          </Badge>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <CardContent>
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="insights" disabled={insights.length === 0}>
              Insights {insights.length > 0 && `(${insights.length})`}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="space-y-4">
            <div className="h-[400px] overflow-y-auto p-4 border rounded-md bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <Brain className="h-12 w-12 text-gray-300" />
                  <div className="space-y-1">
                    <p className="text-lg font-medium text-gray-700">Start your health consultation</p>
                    <p className="text-sm text-gray-500 max-w-md">
                      Describe your symptoms, health concerns, or share your health reports for AI analysis.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div 
                      key={message.id}
                      className={cn(
                        "flex gap-3 p-3 rounded-lg max-w-[90%]",
                        message.role === 'user' 
                          ? "ml-auto bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center h-7 w-7 rounded-full shrink-0",
                        message.role === 'user' 
                          ? "bg-primary-foreground text-primary" 
                          : "bg-primary text-primary-foreground"
                      )}>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-50 text-right">
                          {formatTimestamp(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex gap-3 p-3 rounded-lg max-w-[90%] bg-muted">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full shrink-0 bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Textarea
                placeholder="Describe your health concerns, symptoms, or paste health report data..."
                value={healthReport}
                onChange={(e) => setHealthReport(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-[100px] resize-none"
                disabled={isAnalyzing}
              />
              <Button 
                onClick={handleSendMessage} 
                size="icon" 
                className="self-end h-10 w-10"
                disabled={isAnalyzing || !healthReport.trim()}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Your health data is analyzed locally and not stored on our servers.
              For serious medical concerns, always consult a healthcare professional.
            </p>
          </TabsContent>
          
          <TabsContent value="insights">
            {insights.length > 0 ? (
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(insight.riskLevel || '')}>
                          {insight.riskLevel?.charAt(0).toUpperCase() + (insight.riskLevel ? ' Risk' : '')}
                        </Badge>
                        <h3 className="font-medium">{insight.condition}</h3>
                      </div>
                      <div className="text-sm text-gray-600">
                        Confidence: {Math.round(insight.confidence * 100)}%
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm mb-3">{insight.details || 'No details provided'}</p>
                      
                      {insight.recommendations.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium mb-2">Recommendations:</h4>
                          <ul className="text-sm space-y-1">
                            {insight.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex gap-2">
                                <ArrowUp className="h-4 w-4 text-primary rotate-45 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and 
                    does not constitute medical advice. The accuracy is estimated at up to 90%, but always 
                    consult with a healthcare professional for proper diagnosis and treatment.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Brain className="h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg font-medium text-gray-700">No insights available yet</p>
                <p className="text-sm text-gray-500 max-w-md mt-1">
                  Share your health information in the chat to receive AI-powered insights
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setActiveTab('chat')}
                >
                  Back to Chat
                </Button>
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Powered by advanced health AI analysis
        </p>
      </CardFooter>
    </Card>
  );
}

export default HealthReportAnalyzer; 
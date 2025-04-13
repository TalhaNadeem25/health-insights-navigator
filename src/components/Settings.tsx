import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Key, Save, Eye, EyeOff, ExternalLink } from "lucide-react";

export function Settings() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const { toast } = useToast();

  // Load the API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey') || '';
    setApiKey(savedApiKey);
  }, []);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('geminiApiKey', apiKey.trim());
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error Saving API Key",
        description: "There was an error saving your API key. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Application Settings</CardTitle>
        <CardDescription>
          Configure your application preferences and API keys
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">API Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Connect to Google's Gemini AI API for health insights
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="apiKey" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Gemini API Key
              </Label>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input 
                  id="apiKey"
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key"
                  className="pr-10"
                />
                <button 
                  type="button"
                  onClick={toggleShowApiKey}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <Button onClick={handleSaveApiKey}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground mt-1">
              Your API key is stored only in your browser's local storage and is never sent to our servers.
              This app processes data client-side for enhanced privacy.
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-medium mb-2">Privacy Information</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              Health Insights Navigator respects your privacy and is designed to process data locally whenever possible.
            </p>
            <p>
              When you use the Gemini API integration, your health queries are sent directly from your browser to Google's API.
              We do not store, process, or have access to your health data or API requests.
            </p>
            <p>
              For more information about Google's data practices, please review their 
              <a 
                href="https://ai.google.dev/privacy" 
                target="_blank" 
                rel="noreferrer"
                className="text-primary hover:underline mx-1"
              >
                Gemini API privacy policy
              </a>.
            </p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <p className="text-xs text-muted-foreground">
          Settings are saved locally in your browser
        </p>
      </CardFooter>
    </Card>
  );
} 
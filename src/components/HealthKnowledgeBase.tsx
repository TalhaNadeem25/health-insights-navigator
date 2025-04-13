import React, { useState, useEffect } from 'react';
import { ClientSideVectorStore } from '@/lib/vectorStorage';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Trash2, Database, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthKnowledgeItem {
  id: string;
  content: string;
  metadata: {
    title: string;
    category: string;
    source?: string;
    dateAdded: string;
  };
  score?: number;
}

export function HealthKnowledgeBase() {
  const [vectorStore] = useState<ClientSideVectorStore>(() => new ClientSideVectorStore());
  const [knowledgeItems, setKnowledgeItems] = useState<HealthKnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<HealthKnowledgeItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState<string>('');
  const [newItemContent, setNewItemContent] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<string>('general');
  const [newItemSource, setNewItemSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const { toast } = useToast();

  // Load knowledge items on mount
  useEffect(() => {
    const loadItems = async () => {
      const documents = vectorStore.getAllDocuments();
      const items: HealthKnowledgeItem[] = documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata as HealthKnowledgeItem['metadata']
      }));
      setKnowledgeItems(items);
    };
    
    loadItems();
  }, [vectorStore]);

  // Add a new knowledge item
  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !newItemContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for the knowledge item.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const metadata = {
        title: newItemTitle,
        category: newItemCategory,
        source: newItemSource,
        dateAdded: new Date().toISOString()
      };
      
      const id = await vectorStore.addDocument(newItemContent, metadata);
      
      const newItem: HealthKnowledgeItem = {
        id,
        content: newItemContent,
        metadata
      };
      
      setKnowledgeItems(prev => [...prev, newItem]);
      
      // Clear form
      setNewItemTitle('');
      setNewItemContent('');
      setNewItemCategory('general');
      setNewItemSource('');
      
      toast({
        title: "Knowledge Item Added",
        description: "The health information has been added to your knowledge base.",
      });
    } catch (error) {
      console.error("Error adding knowledge item:", error);
      toast({
        title: "Error Adding Item",
        description: "There was a problem adding this item. Please check your API key settings.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search the knowledge base
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await vectorStore.search(searchQuery);
      
      const searchItems: HealthKnowledgeItem[] = results.map(doc => ({
        id: doc.id,
        content: doc.content,
        metadata: doc.metadata as HealthKnowledgeItem['metadata'],
        score: doc.score
      }));
      
      setSearchResults(searchItems);
      
      if (searchItems.length === 0) {
        toast({
          title: "No Results Found",
          description: "Try a different search query or add more information to your knowledge base.",
        });
      }
    } catch (error) {
      console.error("Error searching knowledge base:", error);
      toast({
        title: "Search Error",
        description: "There was a problem performing the search. Please check your API key settings.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Clear the knowledge base
  const handleClearKnowledgeBase = () => {
    if (confirm("Are you sure you want to clear all items from your knowledge base? This action cannot be undone.")) {
      vectorStore.clear();
      setKnowledgeItems([]);
      setSearchResults([]);
      toast({
        title: "Knowledge Base Cleared",
        description: "All items have been removed from your knowledge base.",
      });
    }
  };

  // Categories for the dropdown
  const categories = [
    { value: 'general', label: 'General Health' },
    { value: 'cardiovascular', label: 'Cardiovascular Health' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'fitness', label: 'Fitness & Exercise' },
    { value: 'mental', label: 'Mental Health' },
    { value: 'prevention', label: 'Preventive Care' },
    { value: 'chronic', label: 'Chronic Conditions' }
  ];

  const getCategoryLabel = (value: string) => {
    const category = categories.find(c => c.value === value);
    return category ? category.label : value;
  };

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      general: 'bg-gray-100 text-gray-800',
      cardiovascular: 'bg-red-100 text-red-800',
      diabetes: 'bg-blue-100 text-blue-800',
      nutrition: 'bg-green-100 text-green-800',
      fitness: 'bg-purple-100 text-purple-800',
      mental: 'bg-yellow-100 text-yellow-800',
      prevention: 'bg-teal-100 text-teal-800',
      chronic: 'bg-orange-100 text-orange-800'
    };
    
    return categoryColors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Health Knowledge Base
          </CardTitle>
          <CardDescription>
            Store and retrieve health information using vector-based semantic search
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Search Health Knowledge</h3>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Search for health information..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full"
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()}>
                Search
              </Button>
            </div>
            
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Search Results:</h4>
                <div className="space-y-3">
                  {searchResults.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{item.metadata.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getCategoryColor(item.metadata.category)}>
                                {getCategoryLabel(item.metadata.category)}
                              </Badge>
                              {item.score !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  Match: {Math.round(item.score * 100)}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{item.content}</p>
                        {item.metadata.source && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Source: {item.metadata.source}
                          </p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 mt-4">
            {/* Add Item Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Health Information</h3>
              
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    placeholder="Enter a title for this health information"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="content" className="text-sm font-medium">
                    Content
                  </label>
                  <Textarea
                    id="content"
                    placeholder="Enter the health information content"
                    value={newItemContent}
                    onChange={(e) => setNewItemContent(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="source" className="text-sm font-medium">
                    Source (optional)
                  </label>
                  <Input
                    id="source"
                    placeholder="Enter the source of this information"
                    value={newItemSource}
                    onChange={(e) => setNewItemSource(e.target.value)}
                  />
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={handleAddItem}
                  disabled={isLoading || !newItemTitle.trim() || !newItemContent.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Knowledge Base
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-4">
          <div className="flex items-center text-xs text-muted-foreground">
            <Info className="h-3 w-3 mr-1" />
            <span>{knowledgeItems.length} items in knowledge base</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearKnowledgeBase}
            disabled={knowledgeItems.length === 0}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Clear Knowledge Base
          </Button>
        </CardFooter>
      </Card>
      
      {/* Knowledge Items Display */}
      {knowledgeItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Health Knowledge Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {knowledgeItems.map((item) => (
                <div key={item.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-medium">{item.metadata.title}</h5>
                      <Badge className={getCategoryColor(item.metadata.category)}>
                        {getCategoryLabel(item.metadata.category)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added: {new Date(item.metadata.dateAdded).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-sm mt-2">{item.content}</p>
                  {item.metadata.source && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {item.metadata.source}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
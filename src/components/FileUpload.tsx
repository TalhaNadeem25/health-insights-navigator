import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { extractDataWithLLM, ExtractedData } from '@/lib/llmDataExtractor';
import { readExcelFile, LifeExpectancyData } from '@/lib/excelService';

interface FileUploadProps {
  onDataExtracted?: (data: ExtractedData) => void;
  onLifeExpectancyDataExtracted?: (data: LifeExpectancyData[]) => void;
}

export function FileUpload({ onDataExtracted, onLifeExpectancyDataExtracted }: FileUploadProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [lifeExpectancyData, setLifeExpectancyData] = useState<LifeExpectancyData[]>([]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);
    setIsExtracting(true);
    
    try {
      console.log('Starting file upload:', file.name);
      
      // Use LLM to extract structured data
      const data = await extractDataWithLLM(file);
      console.log('Extracted data:', data);
      
      setExtractedData(data);
      onDataExtracted?.(data);
      
      // Also process with the regular Excel reader for backward compatibility
      const lifeExpectancyData = await readExcelFile(file);
      setLifeExpectancyData(lifeExpectancyData);
      onLifeExpectancyDataExtracted?.(lifeExpectancyData);
    } catch (error) {
      console.error('Error processing file:', error);
      setError('Error processing file. Please check the file format.');
    } finally {
      setIsLoading(false);
      setIsExtracting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Data Analysis</CardTitle>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="max-w-xs"
            />
            <Button disabled={isLoading || isExtracting}>
              {isLoading ? 'Loading...' : isExtracting ? 'Analyzing...' : 'Upload Excel File'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {extractedData && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">{extractedData.title}</h3>
              <p className="text-sm text-muted-foreground">{extractedData.description}</p>
            </div>
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subcategory</TableHead>
                    {extractedData.dataPoints.length > 0 && 
                      Object.keys(extractedData.dataPoints[0].values).map(key => (
                        <TableHead key={key}>{key}</TableHead>
                      ))
                    }
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedData.dataPoints.map((point) => (
                    <TableRow key={point.id}>
                      <TableCell>{point.id}</TableCell>
                      <TableCell>{point.category || '-'}</TableCell>
                      <TableCell>{point.subcategory || '-'}</TableCell>
                      {Object.entries(point.values).map(([key, value]) => (
                        <TableCell key={key}>
                          {typeof value === 'number' 
                            ? value.toLocaleString(undefined, { maximumFractionDigits: 2 }) 
                            : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Metadata</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(extractedData.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        {!extractedData && !error && (
          <div className="text-center py-8 text-gray-500">
            Upload an Excel file to analyze data
          </div>
        )}
      </CardContent>
    </Card>
  );
} 
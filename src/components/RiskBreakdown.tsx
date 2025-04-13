
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockRiskFactors = [
  { name: 'Obesity', value: 68, color: '#0891b2' },
  { name: 'Hypertension', value: 72, color: '#f43f5e' },
  { name: 'Smoking', value: 58, color: '#8b5cf6' },
  { name: 'Diabetes', value: 75, color: '#10b981' },
  { name: 'Poor Diet', value: 83, color: '#f59e0b' },
  { name: 'Physical Inactivity', value: 78, color: '#ec4899' },
  { name: 'Mental Stress', value: 62, color: '#6366f1' },
];

const mockSocialDeterminants = [
  { name: 'Food Access', value: 53, color: '#0891b2' },
  { name: 'Income Level', value: 65, color: '#f43f5e' },
  { name: 'Education', value: 48, color: '#8b5cf6' },
  { name: 'Housing', value: 62, color: '#10b981' },
  { name: 'Transportation', value: 47, color: '#f59e0b' },
  { name: 'Healthcare Access', value: 58, color: '#ec4899' },
  { name: 'Employment', value: 51, color: '#6366f1' },
];

const mockHealthcareData = [
  { name: 'Screenings', value: 42, color: '#0891b2' },
  { name: 'Preventive Care', value: 38, color: '#f43f5e' },
  { name: 'Primary Care', value: 45, color: '#8b5cf6' },
  { name: 'Chronic Care', value: 62, color: '#10b981' },
  { name: 'Emergency Use', value: 72, color: '#f59e0b' },
  { name: 'Medication', value: 55, color: '#ec4899' },
  { name: 'Specialist Access', value: 38, color: '#6366f1' },
];

interface RiskBreakdownProps {
  isLoading: boolean;
}

const RiskBreakdown = ({ isLoading }: RiskBreakdownProps) => {
  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="factors">
        <TabsList className="mb-4">
          <TabsTrigger value="factors">Risk Factors</TabsTrigger>
          <TabsTrigger value="social">Social Determinants</TabsTrigger>
          <TabsTrigger value="healthcare">Healthcare Utilization</TabsTrigger>
        </TabsList>
        <TabsContent value="factors">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockRiskFactors}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} points`, 'Risk Score']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {mockRiskFactors.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="social">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockSocialDeterminants}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} points`, 'Risk Score']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {mockSocialDeterminants.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
        <TabsContent value="healthcare">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mockHealthcareData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  width={90}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} points`, 'Risk Score']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {mockHealthcareData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskBreakdown;

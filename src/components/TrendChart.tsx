
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockTrendData = [
  { month: 'Jan', diabetes: 54, heart: 67, respiratory: 45, mental: 32 },
  { month: 'Feb', diabetes: 58, heart: 65, respiratory: 48, mental: 34 },
  { month: 'Mar', diabetes: 60, heart: 68, respiratory: 52, mental: 36 },
  { month: 'Apr', diabetes: 63, heart: 72, respiratory: 58, mental: 38 },
  { month: 'May', diabetes: 68, heart: 75, respiratory: 65, mental: 42 },
  { month: 'Jun', diabetes: 70, heart: 74, respiratory: 68, mental: 45 },
  { month: 'Jul', diabetes: 72, heart: 72, respiratory: 65, mental: 48 },
  { month: 'Aug', diabetes: 75, heart: 68, respiratory: 58, mental: 52 },
  { month: 'Sep', diabetes: 78, heart: 70, respiratory: 54, mental: 55 },
  { month: 'Oct', diabetes: 80, heart: 73, respiratory: 51, mental: 58 },
  { month: 'Nov', diabetes: 83, heart: 78, respiratory: 50, mental: 62 },
  { month: 'Dec', diabetes: 87, heart: 82, respiratory: 52, mental: 65 },
];

export const TrendChart = () => {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={mockTrendData}
          margin={{
            top: 10,
            right: 30,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }} 
            label={{ 
              value: 'Risk Score', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle', fontSize: 12 }
            }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}
            formatter={(value: number) => [`${value} points`, undefined]}
          />
          <Legend align="center" verticalAlign="bottom" />
          <Line
            type="monotone"
            dataKey="diabetes"
            name="Diabetes Risk"
            stroke="#0891b2"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="heart"
            name="Heart Disease Risk"
            stroke="#f43f5e"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="respiratory"
            name="Respiratory Risk"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="mental"
            name="Mental Health Risk"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

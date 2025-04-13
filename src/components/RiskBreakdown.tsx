import { CommunityData, RiskFactor } from "@/types/health";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

interface RiskBreakdownProps {
  isLoading: boolean;
  riskFactors: RiskFactor[];
  communityData: CommunityData[];
}

const RiskBreakdown = ({ isLoading, riskFactors, communityData }: RiskBreakdownProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-health-600" />
      </div>
    );
  }

  const getRiskColor = (type: string) => {
    switch (type) {
      case "diabetes":
        return "#ef4444"; // red-500
      case "heartDisease":
        return "#f59e0b"; // amber-500
      case "respiratory":
        return "#3b82f6"; // blue-500
      case "obesity":
        return "#8b5cf6"; // violet-500
      case "smoking":
        return "#64748b"; // slate-500
      default:
        return "#94a3b8"; // slate-400
    }
  };

  const getRiskName = (type: string) => {
    switch (type) {
      case "diabetes":
        return "Diabetes";
      case "heartDisease":
        return "Heart Disease";
      case "respiratory":
        return "Respiratory";
      case "obesity":
        return "Obesity";
      case "smoking":
        return "Smoking";
      default:
        return type;
    }
  };

  const formatData = () => {
    return riskFactors.map(factor => ({
      name: getRiskName(factor.type),
      value: Math.round(factor.value * 100),
      trend: factor.trend,
      color: getRiskColor(factor.type),
    }));
  };

  const data = formatData();

  return (
    <div className="space-y-6">
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis
              domain={[0, 100]}
              label={{
                value: "Risk Score (%)",
                angle: -90,
                position: "insideLeft",
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "Risk Score"]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            />
            <Legend />
            <Bar
              dataKey="value"
              name="Risk Score"
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <rect
                  key={`bar-${index}`}
                  fill={entry.color}
                  x={0}
                  y={0}
                  width={0}
                  height={0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-card text-card-foreground shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{item.name}</h3>
              <div
                className={`w-3 h-3 rounded-full`}
                style={{ backgroundColor: item.color }}
              />
            </div>
            <div className="mt-2">
              <div className="text-2xl font-bold">{item.value}%</div>
              <div className="text-sm text-muted-foreground">
                Risk Score
              </div>
            </div>
            <div className="mt-2">
              <div className="text-sm">
                Trend:{" "}
                <span
                  className={
                    item.trend === "up"
                      ? "text-red-500"
                      : item.trend === "down"
                      ? "text-green-500"
                      : "text-amber-500"
                  }
                >
                  {item.trend === "up"
                    ? "Increasing"
                    : item.trend === "down"
                    ? "Decreasing"
                    : "Stable"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskBreakdown;

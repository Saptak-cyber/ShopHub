import { Card } from "../ui/Card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: "currency" | "number" | "percentage";
}

export function MetricCard({ title, value, icon: Icon, trend, format = "number" }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === "string") return val;
    
    switch (format) {
      case "currency":
        return `$${val.toFixed(2)}`;
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-400">{title}</p>
          <p className="text-3xl font-bold mt-2">{formatValue(value)}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-green-400" : "text-red-400"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-zinc-500 ml-1">vs last period</span>
            </p>
          )}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>
    </Card>
  );
}

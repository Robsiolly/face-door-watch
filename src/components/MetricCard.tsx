import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
}

const variantStyles = {
  default: "border-border/50",
  success: "border-primary/20",
  warning: "border-warning/20",
  danger: "border-destructive/20",
  accent: "border-accent/20",
};

const iconBgStyles = {
  default: "bg-muted",
  success: "bg-primary/10 text-primary",
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  accent: "bg-accent/10 text-accent",
};

export function MetricCard({ title, value, icon, trend, variant = "default" }: MetricCardProps) {
  return (
    <div className={`metric-card ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
          {trend && <p className="text-xs text-primary mt-1">{trend}</p>}
        </div>
        <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

import React, { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger" | "accent";
}

const iconBgStyles = {
  default: "bg-white/5 text-muted-foreground border border-white/5",
  success: "gold-liquid text-primary-foreground shadow-[0_4px_20px_rgba(191,149,63,0.4)]",
  warning: "bg-warning/10 text-warning border border-warning/20",
  danger: "bg-destructive/10 text-destructive border border-destructive/20",
  accent: "gold-aged text-white shadow-[0_4px_20px_rgba(138,102,40,0.4)]",
};

export function MetricCard({ title, value, icon, trend, variant = "default" }: MetricCardProps) {
  return (
    <div className="premium-card group transition-all duration-700 hover:scale-[1.02]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 transition-colors group-hover:text-primary/60">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-3xl sm:text-4xl font-black tracking-tighter ${variant === 'success' || variant === 'accent' || variant === 'default' ? 'gold-text' : 'text-foreground'}`}>
              {value}
            </p>
          </div>
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-wider">{trend}</p>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:rotate-12 ${iconBgStyles[variant]}`}>
          {/* @ts-ignore */}
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
      </div>
    </div>
  );
}


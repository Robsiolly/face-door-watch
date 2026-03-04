import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
      <div className="space-y-2">
        <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter gold-text uppercase leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
            {subtitle}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-wrap md:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
}


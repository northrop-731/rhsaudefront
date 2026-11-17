import type { ReactNode } from 'react';
import Card from './Card';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <Card>
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}

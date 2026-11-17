import type { ReactNode } from 'react';
import Card from './Card';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// Cria uma seção do formulário reutilizando o componente Card como contêiner.
// No App.tsx, divide os campos em blocos temáticos (Dados pessoais, Dados funcionais, Endereço, etc.).
export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <Card>
      // Cabeçalho da seção com título e subtítulo opcional
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-800">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      // Renderiza o grid de FormGroups passado pelo App.tsx
      {children}
    </Card>
  );
}

import type { ReactNode } from 'react';
import { Label } from './Label';

interface FormGroupProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

// Agrupa o componente Label com o campo de entrada (CampoEntrada ou CampoSelecao).
// Usa min-w-0 para evitar que os inputs estourem a largura das colunas do grid no App.tsx.
export function FormGroup({
  label,
  htmlFor,
  required = false,
  className = '',
  children,
}: FormGroupProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      {/* Conecta o texto do rótulo ao id do input via htmlFor e repassa a flag de obrigatório */}
      <Label text={label} htmlFor={htmlFor} required={required} />
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';
import { Label } from './Label';

interface FormGroupProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormGroup({
  label,
  htmlFor,
  required = false,
  className = '',
  children,
}: FormGroupProps) {
  return (
    <div className={`min-w-0 ${className}`}>
      <Label text={label} htmlFor={htmlFor} required={required} />
      {children}
    </div>
  );
}

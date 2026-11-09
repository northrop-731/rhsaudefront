
import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  registro: UseFormRegisterReturn;
  erro?: FieldError;
}

export const CampoEntrada = ({
  registro,
  erro,
  className = '',
  ...resto
}: FieldProps) => (
  <div className="flex flex-col w-full mb-4">
    <input
      {...registro}
      {...resto}
      aria-invalid={!!erro}
      className={`
        w-full box-border p-2
        border border-solid rounded
        outline-none
        focus:ring-2 focus:ring-blue-500
        focus:border-blue-500
        ${erro ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
    />

    {erro && (
      <span className="block text-red-500 text-xs mt-1" role="alert">
        {erro.message}
      </span>
    )}
  </div>
);

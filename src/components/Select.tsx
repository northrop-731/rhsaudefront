
import type { SelectHTMLAttributes } from 'react';
import type {
  UseFormRegisterReturn,
  FieldError,
} from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  registro: UseFormRegisterReturn;
  erro?: FieldError;
  options: Option[];
  placeholder?: string;
}

export const CampoSelecao = ({
  registro,
  erro,
  options,
  placeholder = 'Selecione uma opção',
  className = '',
  ...resto
}: SelectProps) => {
  return (
    <div className="flex flex-col w-full mb-4">
      <select
        {...registro}
        {...resto}
        aria-invalid={!!erro}
        defaultValue=""
        className={`
          w-full box-border p-2
          border border-solid rounded
          bg-white text-gray-900
          outline-none
          focus:ring-2 focus:ring-blue-500
          focus:border-blue-500
          ${erro ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {erro && (
        <span
          className="block text-red-500 text-xs mt-1"
          role="alert"
        >
          {erro.message}
        </span>
      )}
    </div>
  );
};

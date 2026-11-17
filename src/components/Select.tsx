import type { SelectHTMLAttributes } from 'react';
import type {
  UseFormRegisterReturn,
  FieldError,
} from 'react-hook-form';

interface Option {
  value: string;
  label: string;
}

// Segue o mesmo padrão do Field.tsx (CampoEntrada), recebendo o registro e o erro do react-hook-form,
// além da lista de opções que serão renderizadas no dropdown.
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  registro: UseFormRegisterReturn;
  erro?: FieldError;
  options: Option[];
  placeholder?: string;
}

// Select padrão integrado ao react-hook-form.
// Usado dentro de um FormGroup no App.tsx (ex.: seleção de gênero).
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
        {/* Opção inicial vazia e desabilitada para forçar a escolha quando o campo for obrigatório */}
        <option value="" disabled>
          {placeholder}
        </option>

        {/* Mapeia o array de opções passado via props */}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Exibe a mensagem de erro do react-hook-form abaixo do select */}
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

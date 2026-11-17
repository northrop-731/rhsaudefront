import type { InputHTMLAttributes } from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

// Recebe o retorno do register() do react-hook-form na prop 'registro'
// e o objeto de erro correspondente na prop 'erro', além dos atributos nativos de input.
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  registro: UseFormRegisterReturn;
  erro?: FieldError;
}

// Input padrão integrado ao react-hook-form.
// É envolvido pelo FormGroup.tsx lá no App.tsx para compor os campos de texto, número e data.
export const CampoEntrada = ({
  registro,
  erro,
  className = '',
  ...resto
}: FieldProps) => (
  <div className="flex flex-col w-full mb-4">
    {/* Espalha as props do register (name, onChange, onBlur, ref) e os atributos HTML */}
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

    {/* Se houver erro de validação no react-hook-form, exibe a mensagem abaixo do campo */}
    {erro && (
      <span className="block text-red-500 text-xs mt-1" role="alert">
        {erro.message}
      </span>
    )}
  </div>
);

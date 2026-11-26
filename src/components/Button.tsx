import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

import type { LucideIcon } from 'lucide-react';

// Estende os atributos nativos do botão HTML para aceitar onClick, disabled, etc.
// É usado no App.tsx para ações de navegação, reset do formulário e envio (submit).
interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | 'enviar'
    | 'verificar'
    | 'excluir'
    | 'secondary'
    | 'neutral'
    | 'warning';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

// Mapeia cada variante para suas respectivas classes de cor do Tailwind.
const colors = {
  enviar: 'bg-teal-600 text-white hover:bg-teal-700',
  verificar: 'bg-sky-600 text-white hover:bg-sky-700',
  excluir: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  neutral: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
  warning: 'bg-yellow-400 text-yellow-950 hover:bg-yellow-500',
};

// Componente de botão padrão da aplicação.
// Define type="button" por padrão para evitar que botões comuns disparem o submit do formulário no App.tsx.
export function Button({
  children,
  variant = 'enviar',
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center gap-2
        px-4 py-2 rounded-lg
        text-sm font-medium
        transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${colors[variant]}
        ${className}
      `}
      {...rest}
    >
      {/* Renderiza o ícone à esquerda do texto se iconPosition for 'left' */}
      {Icon && iconPosition === 'left' && (
        <Icon size={16} aria-hidden="true" />
      )}

      {children}

      {/* Renderiza o ícone à direita do texto se iconPosition for 'right' */}
      {Icon && iconPosition === 'right' && (
        <Icon size={16} aria-hidden="true" />
      )}
    </button>
  );
}

export default Button;

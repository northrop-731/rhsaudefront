
import type {
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';

import type { LucideIcon } from 'lucide-react';

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | 'enviar'
    | 'verificar'
    | 'excluir'
    | 'secondary'
    | 'neutral';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
}

const colors = {
  enviar: 'bg-teal-600 text-white hover:bg-teal-700',
  verificar: 'bg-sky-600 text-white hover:bg-sky-700',
  excluir: 'bg-red-600 text-white hover:bg-red-700',
  secondary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  neutral: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
};

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
      {Icon && iconPosition === 'left' && (
        <Icon size={16} aria-hidden="true" />
      )}

      {children}

      {Icon && iconPosition === 'right' && (
        <Icon size={16} aria-hidden="true" />
      )}
    </button>
  );
}

export default Button;

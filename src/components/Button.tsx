import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'enviar' | 'verificar' | 'excluir'
}

export function Button({
  children,
  variant = 'enviar',
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  let cor = 'bg-teal-600 text-white hover:bg-teal-700'

  if (variant === 'verificar') {
    cor = 'bg-sky-600 text-white hover:bg-sky-700'
  } else if (variant === 'excluir') {
    cor = 'bg-red-600 text-white hover:bg-red-700'
  }

  return (
    <button
      type={type}
      className={`px-4 py-2 rounded-lg font-medium transition cursor-pointer disabled:opacity-50 ${cor} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button
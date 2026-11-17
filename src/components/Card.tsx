import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

// Contêiner visual base com fundo branco, borda arredondada e sombra leve.
// É usado pelo FormSection.tsx para envolver cada seção do formulário
// e diretamente no App.tsx para criar o bloco lateral de resumo do servidor.
export default function Card({ children }: CardProps) {
  return (
    <div
      className="
        w-full
        rounded-xl
        border border-gray-200
        bg-white
        p-6
        shadow-sm
      "
    >
      {children}
    </div>
  );
}

import type { ReactNode } from 'react';

interface SecaoDetalhesProps {
  titulo: string;
  children: ReactNode;
}

export function SecaoDetalhes({
  titulo,
  children,
}: SecaoDetalhesProps) {
  return (
    <section className="border-b border-slate-200 pb-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-800">
        {titulo}
      </h3>

      <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
}
interface DetalheServidorProps {
  label: string;
  valor?: string | number | null;
}

export function DetalheServidor({
  label,
  valor,
}: DetalheServidorProps) {
  return (
    <div className="min-w-0">
      <span className="block text-xs text-slate-500">
        {label}
      </span>

      <strong className="block break-words font-medium text-slate-800">
        {valor == null || valor === '' ? 'Não informado' : valor}
      </strong>
    </div>
  );
}
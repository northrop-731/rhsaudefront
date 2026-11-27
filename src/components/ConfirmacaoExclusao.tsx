import { useState } from 'react';
import { Trash2, TriangleAlert } from 'lucide-react';
import Button from './Button';

interface ConfirmacaoExclusaoProps {
  nome: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  excluindo: boolean;
}

export function ConfirmacaoExclusao({
  nome,
  onConfirmar,
  onCancelar,
  excluindo,
}: ConfirmacaoExclusaoProps) {
  const [confirmado, setConfirmado] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">

      <div className="mb-3 flex items-center gap-2 text-red-700">
        <TriangleAlert size={20} />

        <h3 className="font-semibold">
          Confirmar exclusão
        </h3>
      </div>

      <p className="mb-2 text-sm text-slate-700">
        Deseja excluir o cadastro de <strong>{nome}</strong>?
      </p>

      <p className="mb-4 text-sm text-red-700">
        Todos os dados deste servidor serão excluídos do
        banco de dados. Essa ação não poderá ser desfeita.
      </p>

      <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={confirmado}
          disabled={excluindo}
          onChange={(event) =>
            setConfirmado(event.target.checked)
          }
          className="size-4 accent-red-600"
        />

        Estou ciente de que a exclusão é permanente.
      </label>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="neutral"
          onClick={onCancelar}
          disabled={excluindo}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="excluir"
          icon={Trash2}
          disabled={!confirmado || excluindo}
          onClick={() => {
            if (confirmado && !excluindo) {
              onConfirmar();
            }
          }}
        >
          {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
        </Button>
      </div>

    </div>
  );
}
import { useState, useEffect, useRef } from 'react';
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
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    dialog?.showModal();

    return () => {
      dialog?.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="titulo-exclusao"
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-black/50"
      onCancel={(event) => {
        event.preventDefault();

        if (!excluindo) {
          onCancelar();
        }
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <TriangleAlert size={24} />
        </div>

        <h3
          id="titulo-exclusao"
          className="text-lg font-semibold text-slate-800"
        >
          Confirmar exclusão
        </h3>
      </div>

      <p className="mb-3 text-sm text-slate-700">
        Deseja excluir o cadastro de <strong>{nome}</strong>?
      </p>

      <p className="mb-5 text-sm text-red-700">
        Todos os dados deste servidor serão excluídos do
        banco de dados. Essa ação não poderá ser desfeita.
      </p>

      <div className="mb-5 border-t border-slate-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={confirmado}
            disabled={excluindo}
            onChange={(event) =>
              setConfirmado(event.target.checked)
            }
            className="size-4 shrink-0 accent-red-600"
          />

          Estou ciente de que a exclusão é permanente.
        </label>
      </div>

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
    </dialog>
  );
}
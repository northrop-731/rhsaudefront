import { useState, useEffect, useRef } from 'react';
import { Check, TriangleAlert } from 'lucide-react';
import Button from './Button';

interface ConfirmacaoEdicaoProps {
  nome: string;
  onConfirmar: () => void;
  onCancelar: () => void;
  salvando: boolean;
}

export function ConfirmacaoEdicao({
  nome,
  onConfirmar,
  onCancelar,
  salvando,
}: ConfirmacaoEdicaoProps) {
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
      aria-labelledby="titulo-edicao"
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl backdrop:bg-black/50"
      onCancel={(event) => {
        event.preventDefault();

        if (!salvando) {
          onCancelar();
        }
      }}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
          <TriangleAlert size={24} />
        </div>

        <h3
          id="titulo-edicao"
          className="text-lg font-semibold text-slate-800"
        >
          Confirmar alterações
        </h3>
      </div>

      <p className="mb-3 text-sm text-slate-700">
        Deseja salvar as alterações no cadastro de{' '}
        <strong>{nome}</strong>?
      </p>

      <p className="mb-5 text-sm text-slate-600">
        As informações anteriores serão atualizadas no banco de dados.
      </p>

      <div className="mb-5 border-t border-slate-200 pt-4">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={confirmado}
            disabled={salvando}
            onChange={(event) =>
              setConfirmado(event.target.checked)
            }
            className="size-4 shrink-0 accent-teal-600"
          />

          Confirmo que revisei os dados e desejo salvar as alterações.
        </label>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="neutral"
          onClick={onCancelar}
          disabled={salvando}
        >
          Cancelar
        </Button>

        <Button
          type="button"
          variant="enviar"
          icon={Check}
          disabled={!confirmado || salvando}
          onClick={() => {
            if (confirmado && !salvando) {
              onConfirmar();
            }
          }}
        >
          {salvando ? 'Salvando...' : 'Confirmar alterações'}
        </Button>
      </div>
    </dialog>
  );
}